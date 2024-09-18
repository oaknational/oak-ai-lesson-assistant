import { expect } from "@jest/globals";
import invariant from "tiny-invariant";

import { Aila } from ".";
import { MessagePart, TextDocument } from "../protocol/jsonPatchProtocol";

export function checkAssistantResponse(content: string) {
  // Check that the response is a string (not JSON)
  expect(typeof content).toBe("string");

  // Check that the response doesn't contain backticked JSON
  expect(content).not.toMatch(/```json/);

  // Check that the response doesn't include markdown titles
  // expect(content).not.toContain("##");

  // Check that the response doesn't include definitions of the sections it is going to create
  expect(content).not.toContain(":**");
}

export function expectToContainEdits(content: string) {
  expect(content.toLowerCase()).toMatch(/edit|update|change|modify/);
}
// Adjust the import path as needed

export function expectPatch(
  parsedMessage: MessagePart[],
  operation: string,
  path: string,
  value?: string,
) {
  expect(parsedMessage).toContainEqual(
    expect.objectContaining({
      type: "patch",
      value: expect.objectContaining({
        op: operation,
        path: path,
        value: value === undefined ? expect.any(String) : value,
      }),
    }),
  );
}

export function expectText(message: MessagePart[], expectedText: string) {
  const textMessage = message.find(
    (part): part is MessagePart & { document: TextDocument } =>
      part.document.type === "text",
  );
  expect(textMessage).toBeDefined();
  expect(textMessage).toHaveProperty("type", "text");
  expect(textMessage).toHaveProperty("value");
  invariant(textMessage, "Text message is not defined");
  expect(textMessage.document.value).toContain(expectedText);
}

export function checkLastMessage(aila: Aila): MessagePart[] {
  const lastMessage = aila.chat.messages[aila.chat.messages.length - 1];
  expect(lastMessage).toBeDefined();
  invariant(lastMessage, "Last message is not defined");
  expect(lastMessage.role).toBe("assistant");

  checkAssistantResponse(lastMessage.content);

  const lastParsedMessage =
    aila.chat.parsedMessages[aila.chat.messages.length - 1];
  expect(lastParsedMessage).toBeDefined();
  invariant(lastParsedMessage, "Last message is not defined");

  return lastParsedMessage;
}
