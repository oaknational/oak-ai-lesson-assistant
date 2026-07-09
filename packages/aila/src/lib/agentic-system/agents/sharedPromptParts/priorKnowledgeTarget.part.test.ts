import type { PartialLessonPlan } from "../../../../protocol/schema";
import type { AilaExecutionContext } from "../../types";
import { priorKnowledgeTargetPromptPart } from "./priorKnowledgeTarget.part";

const makeCtx = (document: PartialLessonPlan): AilaExecutionContext =>
  ({ currentTurn: { document } }) as AilaExecutionContext;

describe("priorKnowledgeTargetPromptPart", () => {
  it("lists each prior knowledge statement as a bullet", () => {
    const part = priorKnowledgeTargetPromptPart(
      makeCtx({
        priorKnowledge: ["Pupils can count to 100", "Pupils can halve shapes"],
      }),
    );

    expect(part).toContain("- Pupils can count to 100");
    expect(part).toContain("- Pupils can halve shapes");
    expect(part).toContain("PRIOR KNOWLEDGE TO ASSESS");
  });

  it("falls back to prerequisite guidance when prior knowledge is missing", () => {
    const part = priorKnowledgeTargetPromptPart(makeCtx({}));

    expect(part).toContain("No prior knowledge statements exist yet");
    expect(part).toContain("do not test the lesson's own content");
  });

  it("falls back to prerequisite guidance when prior knowledge is empty", () => {
    const part = priorKnowledgeTargetPromptPart(
      makeCtx({ priorKnowledge: [] }),
    );

    expect(part).toContain("No prior knowledge statements exist yet");
  });

  it("tells the model never to test what the lesson will teach", () => {
    const part = priorKnowledgeTargetPromptPart(
      makeCtx({ priorKnowledge: ["Pupils can count to 100"] }),
    );

    expect(part).toMatch(/never test or hint at what this lesson itself/i);
  });
});
