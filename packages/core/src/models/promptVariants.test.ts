import { z } from "zod/v3";

import type { OakPromptDefinition } from "../prompts/types";
import { PromptVariants, promptHash } from "./promptVariants";

function promptDefinition(): OakPromptDefinition {
  return {
    appId: "lesson-planner",
    name: "Test prompt",
    slug: "test-prompt",
    inputSchema: z.object({}),
    outputSchema: z.object({}),
    variants: [
      {
        slug: "main",
        parts: {
          body: "main body",
          context: "",
          output: "",
          task: "",
        },
      },
      {
        slug: "target",
        parts: {
          body: "target body",
          context: "",
          output: "",
          task: "",
        },
      },
    ],
  };
}

describe("PromptVariants", () => {
  const originalCommitSha = process.env.VERCEL_GIT_COMMIT_SHA;

  afterEach(() => {
    process.env.VERCEL_GIT_COMMIT_SHA = originalCommitSha;
  });

  it("selects the requested variant without mutating variant slugs", () => {
    const definition = promptDefinition();

    const prompts = new PromptVariants({} as never, definition, "target");

    expect(prompts.variant.parts.body).toBe("target body");
    expect(definition.variants.map((variant) => variant.slug)).toEqual([
      "main",
      "target",
    ]);
  });

  it("falls back to the main variant when the requested variant is absent", () => {
    const prompts = new PromptVariants(
      {} as never,
      promptDefinition(),
      "missing",
    );

    expect(prompts.variant.parts.body).toBe("main body");
  });

  it("includes the deploy sha in normal prompt hashes", () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "commit_a";
    const hashA = promptHash({
      slug: "test-prompt",
      variant: "main",
      template: "body",
    });

    process.env.VERCEL_GIT_COMMIT_SHA = "commit_b";
    const hashB = promptHash({
      slug: "test-prompt",
      variant: "main",
      template: "body",
    });

    expect(hashA).not.toBe(hashB);
    expect(hashA).toContain("commit_a");
    expect(hashB).toContain("commit_b");
  });

  it("can hash prompts independently of deploy sha", () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "commit_a";
    const hashA = promptHash({
      slug: "test-prompt",
      variant: "main",
      template: "body",
      stableAcrossDeploys: true,
    });

    process.env.VERCEL_GIT_COMMIT_SHA = "commit_b";
    const hashB = promptHash({
      slug: "test-prompt",
      variant: "main",
      template: "body",
      stableAcrossDeploys: true,
    });

    expect(hashA).toBe(hashB);
    expect(hashA).not.toContain("commit_a");
    expect(hashA).not.toContain("commit_b");
  });
});
