import zodToJsonSchema from "zod-to-json-schema";

import { LLMMessageSchema } from "./jsonPatchProtocol";

// The legacy chat path sends LLMMessageSchema to OpenAI structured outputs,
// which rejects optional fields. The composed slide fields on CycleSchema are
// optional and pipeline-written, so they must never leak into this schema.
// A leak here breaks every legacy lesson generation at request time.
describe("legacy LLM message schema", () => {
  it("contains no composed slide fields", () => {
    const json = JSON.stringify(zodToJsonSchema(LLMMessageSchema));
    expect(json).not.toContain("practiceSlideText");
    expect(json).not.toContain("practiceStimulusSlideText");
  });
});
