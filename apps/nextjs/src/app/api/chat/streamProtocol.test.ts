import type { ErrorDocument } from "@oakai/aila/src/protocol/jsonPatchProtocol";

import { streamingJSON } from "./protocol";
import {
  CHAT_STREAM_PROTOCOL,
  CHAT_STREAM_PROTOCOL_HEADER,
  formatChatResponse,
} from "./streamProtocol";

const aila = '\n␞\n{"type":"comment","value":"CHAT_COMPLETE"}\n␞\n';

function streamOf(chunks: Uint8Array[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));
      controller.close();
    },
  });
}

// Splits the text's bytes in two, inside the multi-byte "␞"
function splitInsideCharacter(text: string) {
  const bytes = new TextEncoder().encode(text);
  const separatorEnd = bytes.indexOf(0x9e) + 1;
  return [bytes.slice(0, separatorEnd - 1), bytes.slice(separatorEnd - 1)];
}

const newClientRequest = () =>
  new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { [CHAT_STREAM_PROTOCOL_HEADER]: CHAT_STREAM_PROTOCOL },
  });
const legacyClientRequest = () =>
  new Request("http://localhost/api/chat", { method: "POST" });

// How the AI SDK 4 client read the response: every line is a "0:" text part
function readAsLegacyClient(body: string) {
  return body
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      expect(line.startsWith("0:")).toBe(true);
      return JSON.parse(line.slice(2)) as string;
    })
    .join("");
}

describe("formatChatResponse", () => {
  it("passes the stream through for clients that read plain text", async () => {
    const response = formatChatResponse(
      newClientRequest(),
      new Response(streamOf(splitInsideCharacter(aila)), {
        headers: { "Content-Type": "text/event-stream" },
      }),
    );

    expect(response.headers.get(CHAT_STREAM_PROTOCOL_HEADER)).toBe(
      CHAT_STREAM_PROTOCOL,
    );
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(await response.text()).toBe(aila);
  });

  it("frames the stream as text parts for clients from before the upgrade", async () => {
    const response = formatChatResponse(
      legacyClientRequest(),
      new Response(streamOf(splitInsideCharacter(aila))),
    );

    expect(readAsLegacyClient(await response.text())).toBe(aila);
  });

  it.each([
    ["clients that read plain text", newClientRequest, (body: string) => body],
    [
      "clients from before the upgrade",
      legacyClientRequest,
      readAsLegacyClient,
    ],
  ])("sends error documents to %s", async (_name, request, read) => {
    const error: ErrorDocument = {
      type: "error",
      value: 'Limit "reached"\nCome back later',
      message: "Rate limited",
    };

    const response = formatChatResponse(request(), streamingJSON(error));

    expect(JSON.parse(read(await response.text()))).toEqual(error);
  });

  it.each([401, 500])("leaves %s responses unchanged", async (status) => {
    const original = new Response("Unauthorized", { status });

    const response = formatChatResponse(legacyClientRequest(), original);

    expect(response).toBe(original);
    expect(response.headers.has(CHAT_STREAM_PROTOCOL_HEADER)).toBe(false);
    expect(await response.text()).toBe("Unauthorized");
  });
});
