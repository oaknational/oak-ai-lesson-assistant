import { readdirSync } from "node:fs";
import path from "node:path";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { BasedOnSchema } from "../../../protocol/schema";

// executeGenericPromptAgent wraps each agent's response schema like this before
// sending it to OpenAI structured outputs. Building the format throws for
// schemas OpenAI can't accept, such as overlapping unions, which would
// otherwise only fail when a teacher sends a message.
function toAgentResponseFormat(schema: z.ZodType) {
  return zodTextFormat(z.object({ value: schema }), "agent_response_schema");
}

function findSchemaFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findSchemaFiles(entryPath);
    }
    return entry.name.endsWith(".schema.ts") ? [entryPath] : [];
  });
}

// Stored schemas re-exported next to a response schema. CycleSchema has
// optional fields our code composes, so the agent responds with
// CycleAgentResponseSchema instead.
const storedSchemas = new Set(["CycleSchema"]);

// Every other schema exported from an agent's schema file, so new agents are
// covered
const schemaFileSchemas = findSchemaFiles(__dirname).flatMap((file) =>
  Object.entries(jest.requireActual<Record<string, unknown>>(file))
    .filter((entry): entry is [string, z.ZodType] => {
      return entry[1] instanceof z.ZodType && !storedSchemas.has(entry[0]);
    })
    .map(
      ([name, schema]) =>
        [`${path.relative(__dirname, file)} ${name}`, schema] as const,
    ),
);

describe("agent response formats", () => {
  it("finds the agents' schema files", () => {
    expect(schemaFileSchemas.length).toBeGreaterThan(10);
  });

  it.each([
    ...schemaFileSchemas,
    // The basedOn agent responds with the stored schema, so has no schema file
    ["basedOn", BasedOnSchema.nullable()] as const,
  ])("builds an OpenAI structured output format for %s", (_name, schema) => {
    expect(() => toAgentResponseFormat(schema)).not.toThrow();
  });
});
