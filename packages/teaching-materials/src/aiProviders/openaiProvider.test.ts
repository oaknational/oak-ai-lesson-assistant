import { moderationResponseSchema } from "@oakai/core/src/utils/ailaModeration/moderationSchema";

import { generatePartialLessonPlanObject } from "../documents/partialLessonPlan/generateLessonPlan";
import { teachingMaterialSchemasMap } from "../documents/teachingMaterials/configSchema";
import { OpenAIProvider } from "./openaiProvider";

type ChatRequestBody = {
  temperature?: number;
  response_format?: {
    type: string;
    json_schema?: { strict?: boolean; schema?: unknown };
  };
};

// Records the request OpenAI would receive. The 400 response isn't retried,
// so each generation makes exactly one request
function captureOpenAIRequests() {
  const bodies: ChatRequestBody[] = [];
  jest.spyOn(globalThis, "fetch").mockImplementation((_input, init) => {
    bodies.push(JSON.parse(String(init?.body)) as ChatRequestBody);
    return Promise.resolve(
      new Response(JSON.stringify({ error: { message: "captured" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );
  });
  return bodies;
}

describe("OpenAIProvider requests", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ...Object.entries(teachingMaterialSchemasMap),
    ["moderation", moderationResponseSchema] as const,
  ])("sends %s as strict structured output", async (_name, schema) => {
    const bodies = captureOpenAIRequests();

    await expect(
      // Typed as unknown: each case has a different schema
      OpenAIProvider.generateObject<unknown>({ prompt: "Generate", schema }),
    ).rejects.toThrow();

    expect(bodies).toHaveLength(1);
    expect(bodies[0]?.temperature).toBe(0);
    expect(bodies[0]?.response_format?.type).toBe("json_schema");
    expect(bodies[0]?.response_format?.json_schema?.strict).toBe(true);
  });

  it("sends the partial lesson plan in JSON mode", async () => {
    const bodies = captureOpenAIRequests();

    await expect(
      generatePartialLessonPlanObject({
        parsedInput: {
          context: {
            year: "5",
            lessonParts: ["title", "learningOutcome"],
            subject: "Maths",
            title: "Test Lesson",
          },
        },
      }),
    ).rejects.toThrow();

    expect(bodies).toHaveLength(1);
    expect(bodies[0]?.temperature).toBe(0);
    expect(bodies[0]?.response_format).toEqual({ type: "json_object" });
  });
});
