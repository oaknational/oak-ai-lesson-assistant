import zodToJsonSchema from "zod-to-json-schema";

import { LLMMessageSchema } from "./jsonPatchProtocol";

// The legacy chat sends LLMMessageSchema to OpenAI structured outputs, which
// rejects optional fields. The composed slide fields are optional and written
// by our code, never by the model, so they must never appear in this schema.
// If one leaks in, every legacy lesson generation fails at request time.
describe("legacy LLM message schema", () => {
  it("contains no composed slide fields", () => {
    const json = JSON.stringify(zodToJsonSchema(LLMMessageSchema));
    expect(json).not.toContain("practiceSlideText");
    expect(json).not.toContain("practiceStimulusSlideText");
  });
});
