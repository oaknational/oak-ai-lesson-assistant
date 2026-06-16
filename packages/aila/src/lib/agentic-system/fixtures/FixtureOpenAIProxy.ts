import type OpenAI from "openai";

import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

import { aiLogger } from "@oakai/logger";

import type { AgenticFixtureConfig } from "../../../core/types";

const log = aiLogger("aila:fixtures");

type ResponsesParseParams = Parameters<OpenAI["responses"]["parse"]>[0];
type ResponsesParseResult = Awaited<ReturnType<OpenAI["responses"]["parse"]>>;

type AgenticRecording = {
  params: ResponsesParseParams;
  result: ResponsesParseResult;
};

const INPUT_PREVIEW_LENGTH = 300;

function recordingsRoot(): string {
  return (
    process.env.AILA_FIXTURE_RECORDINGS_PATH ??
    path.join(process.cwd(), "tests-e2e", "recordings")
  );
}

function recordingPath(fixtureName: string, callIndex: number): string {
  return path.join(recordingsRoot(), `${fixtureName}-${callIndex}.json`);
}

// The preview covers only the static instruction prefix of the input: later
// content embeds RAG lesson data fetched live from the database, which can
// differ between the recording and replaying environments.
function inputPreview(p: ResponsesParseParams): string {
  return JSON.stringify(p.input).slice(0, INPUT_PREVIEW_LENGTH);
}

function replayRecording(
  filePath: string,
  callIndex: number,
  params: ResponsesParseParams,
): ResponsesParseResult {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Agentic fixture missing: ${filePath}. ` +
        `Run the e2e test in record mode against a local dev server to regenerate it.`,
    );
  }

  const recording = JSON.parse(
    fs.readFileSync(filePath, "utf8"),
  ) as AgenticRecording;

  const recordedPreview = inputPreview(recording.params);
  const incomingPreview = inputPreview(params);
  if (
    recordedPreview !== incomingPreview ||
    recording.params.model !== params.model
  ) {
    throw new Error(
      `Agentic fixture mismatch at call ${callIndex} (${filePath}). ` +
        `The sequence of agent calls has likely changed since this fixture was ` +
        `recorded — re-record the agentic fixtures.\n` +
        `Recorded model: ${String(recording.params.model)}, incoming model: ${String(params.model)}\n` +
        `Recorded input starts: ${recordedPreview}\n` +
        `Incoming input starts: ${incomingPreview}`,
    );
  }

  return recording.result;
}

export function wrapOpenAIWithFixture(
  openai: OpenAI,
  fixture: AgenticFixtureConfig,
): OpenAI {
  let callIndex = 0;

  const wrappedParse = async (
    params: ResponsesParseParams,
  ): Promise<ResponsesParseResult> => {
    const index = callIndex++;
    const filePath = recordingPath(fixture.fixtureName, index);

    if (fixture.mode === "replay") {
      log.info("Fixture replay: call %d -> %s", index, filePath);
      return replayRecording(filePath, index, params);
    }

    log.info(
      "Fixture record: call %d, model=%s -> %s",
      index,
      String(params.model),
      filePath,
    );
    const result = await openai.responses.parse(params);
    await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
    const recording: AgenticRecording = { params, result };
    await fsPromises.writeFile(filePath, JSON.stringify(recording, null, 2));
    log.info("Fixture record: wrote %s", filePath);
    return result;
  };

  const responsesProxy = new Proxy(openai.responses, {
    get(target, prop, receiver) {
      if (prop === "parse") {
        return wrappedParse;
      }
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }
      throw new Error(
        `FixtureOpenAIProxy: openai.responses.${prop} is not supported — ` +
          `only parse() is recorded/replayed. Add support in FixtureOpenAIProxy.ts.`,
      );
    },
  });

  return new Proxy(openai, {
    get(target, prop, receiver) {
      if (prop === "responses") {
        return responsesProxy;
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
