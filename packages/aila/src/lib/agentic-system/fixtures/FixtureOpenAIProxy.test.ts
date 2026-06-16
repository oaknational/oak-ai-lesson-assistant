import type OpenAI from "openai";

import fs from "fs";
import os from "os";
import path from "path";

import { wrapOpenAIWithFixture } from "./FixtureOpenAIProxy";

type ParseParams = Parameters<OpenAI["responses"]["parse"]>[0];
type ParseResult = Awaited<ReturnType<OpenAI["responses"]["parse"]>>;

const fakeResult = {
  output: [],
  output_parsed: { value: { title: "Romans" } },
} as unknown as ParseResult;

const params = {
  model: "gpt-4.1",
  input: "You are a lesson planning agent. Plan a lesson.",
  stream: false,
} as unknown as ParseParams;

function makeFakeOpenAI(parse: jest.Mock): OpenAI {
  return { responses: { parse } } as unknown as OpenAI;
}

describe("wrapOpenAIWithFixture", () => {
  let recordingsDir: string;

  beforeEach(() => {
    recordingsDir = fs.mkdtempSync(path.join(os.tmpdir(), "agentic-fixtures-"));
    process.env.AILA_FIXTURE_RECORDINGS_PATH = recordingsDir;
  });

  afterEach(() => {
    delete process.env.AILA_FIXTURE_RECORDINGS_PATH;
    fs.rmSync(recordingsDir, { recursive: true, force: true });
  });

  async function recordOnce(fixtureName: string) {
    const parse = jest.fn().mockResolvedValue(fakeResult);
    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(parse), {
      mode: "record",
      fixtureName,
    });
    await wrapped.responses.parse(params);
    return parse;
  }

  it("record mode calls the real API and writes an indexed recording with params", async () => {
    const parse = await recordOnce("agentic/test-fixture");

    expect(parse).toHaveBeenCalledTimes(1);
    const file = path.join(recordingsDir, "agentic", "test-fixture-0.json");
    const saved = JSON.parse(fs.readFileSync(file, "utf8")) as {
      params: ParseParams;
      result: ParseResult;
    };
    expect(saved.params.model).toBe("gpt-4.1");
    expect(saved.result).toEqual(JSON.parse(JSON.stringify(fakeResult)));
  });

  it("increments the call index across calls", async () => {
    const parse = jest.fn().mockResolvedValue(fakeResult);
    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(parse), {
      mode: "record",
      fixtureName: "agentic/test-fixture",
    });
    await wrapped.responses.parse(params);
    await wrapped.responses.parse(params);

    expect(
      fs.existsSync(path.join(recordingsDir, "agentic", "test-fixture-1.json")),
    ).toBe(true);
  });

  it("replay mode returns the recording without calling the API", async () => {
    await recordOnce("agentic/test-fixture");

    const parse = jest.fn();
    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(parse), {
      mode: "replay",
      fixtureName: "agentic/test-fixture",
    });
    const result = await wrapped.responses.parse(params);

    expect(parse).not.toHaveBeenCalled();
    expect(result).toEqual(JSON.parse(JSON.stringify(fakeResult)));
  });

  it("replay throws a clear error when the fixture file is missing", async () => {
    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(jest.fn()), {
      mode: "replay",
      fixtureName: "agentic/does-not-exist",
    });

    await expect(wrapped.responses.parse(params)).rejects.toThrow(
      /Agentic fixture missing/,
    );
  });

  it("replay throws a mismatch error when params differ from the recording", async () => {
    await recordOnce("agentic/test-fixture");

    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(jest.fn()), {
      mode: "replay",
      fixtureName: "agentic/test-fixture",
    });
    const differentParams = {
      ...params,
      input: "You are a completely different agent.",
    } as unknown as ParseParams;

    await expect(wrapped.responses.parse(differentParams)).rejects.toThrow(
      /Agentic fixture mismatch/,
    );
  });

  it("throws for unsupported responses methods", () => {
    const wrapped = wrapOpenAIWithFixture(makeFakeOpenAI(jest.fn()), {
      mode: "replay",
      fixtureName: "agentic/test-fixture",
    });

    expect(() => {
      void (wrapped.responses as unknown as Record<string, unknown>).create;
    }).toThrow(/not supported/);
  });
});
