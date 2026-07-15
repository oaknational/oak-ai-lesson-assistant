import type { PrismaClientWithAccelerate } from "@oakai/db/client";

import {
  type AgenticPromptTemplate,
  __clearAgenticPromptIdCache,
  resolveAgenticPromptIds,
} from "./agenticPromptRegistry";

function createMockPrisma(promptId: string) {
  const findFirst = jest.fn().mockResolvedValue({ id: promptId });
  const findFirstOrThrow = jest
    .fn()
    .mockResolvedValue({ id: "lesson-planner" });
  const upsert = jest.fn().mockResolvedValue({ id: promptId });
  const updateMany = jest.fn().mockResolvedValue({ count: 0 });
  const prisma = {
    prompt: { findFirst, upsert, updateMany },
    app: { findFirstOrThrow },
    $queryRaw: jest.fn().mockResolvedValue([{ max_version: 0 }]),
  } as unknown as PrismaClientWithAccelerate;
  return { prisma, findFirst, findFirstOrThrow, upsert, updateMany };
}

function tpl(promptTemplateId: string): AgenticPromptTemplate {
  return { promptTemplateId, promptTemplate: `body for ${promptTemplateId}` };
}

function tplWithBody(
  promptTemplateId: string,
  promptTemplate: string,
): AgenticPromptTemplate {
  return { promptTemplateId, promptTemplate };
}

describe("resolveAgenticPromptIds", () => {
  beforeEach(() => {
    __clearAgenticPromptIdCache();
  });

  it("resolves each template to its prompt id", async () => {
    const { prisma } = createMockPrisma("prompt_x");

    const result = await resolveAgenticPromptIds({
      prisma,
      templates: [tpl("planner"), tpl("cycle--default")],
    });

    expect(result).toEqual({
      planner: "prompt_x",
      "cycle--default": "prompt_x",
    });
  });

  it("deduplicates repeated template ids within a single call", async () => {
    const { prisma, findFirst } = createMockPrisma("prompt_x");

    await resolveAgenticPromptIds({
      prisma,
      templates: [tpl("planner"), tpl("planner"), tpl("planner")],
    });

    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it("caches resolution across calls so the db is hit once per template", async () => {
    const { prisma, findFirst } = createMockPrisma("prompt_x");

    await resolveAgenticPromptIds({ prisma, templates: [tpl("planner")] });
    await resolveAgenticPromptIds({ prisma, templates: [tpl("planner")] });

    expect(findFirst).toHaveBeenCalledTimes(1);
  });

  it("does not reuse the cached prompt id when the same template id has a new body", async () => {
    const { prisma, findFirst } = createMockPrisma("prompt_x");

    await resolveAgenticPromptIds({
      prisma,
      templates: [tplWithBody("planner", "body v1")],
    });
    await resolveAgenticPromptIds({
      prisma,
      templates: [tplWithBody("planner", "body v2")],
    });

    expect(findFirst).toHaveBeenCalledTimes(2);
  });

  it("rejects conflicting bodies for the same template id in one resolution", async () => {
    const { prisma, findFirst } = createMockPrisma("prompt_x");

    await expect(
      resolveAgenticPromptIds({
        prisma,
        templates: [
          tplWithBody("planner", "body v1"),
          tplWithBody("planner", "body v2"),
        ],
      }),
    ).rejects.toThrow("Conflicting agentic prompt templates for planner");
    expect(findFirst).not.toHaveBeenCalled();
  });

  it("does not cache failures", async () => {
    const findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce({ id: "prompt_recovered" });
    const prisma = {
      prompt: { findFirst },
    } as unknown as PrismaClientWithAccelerate;

    await expect(
      resolveAgenticPromptIds({ prisma, templates: [tpl("planner")] }),
    ).rejects.toThrow("db down");

    const result = await resolveAgenticPromptIds({
      prisma,
      templates: [tpl("planner")],
    });

    expect(result).toEqual({ planner: "prompt_recovered" });
    expect(findFirst).toHaveBeenCalledTimes(2);
  });

  it("creates a prompt row from the captured body when none is current", async () => {
    const { prisma, findFirst, findFirstOrThrow, upsert, updateMany } =
      createMockPrisma("prompt_created");
    findFirst.mockResolvedValueOnce(null);

    const result = await resolveAgenticPromptIds({
      prisma,
      templates: [tpl("planner")],
    });

    expect(result).toEqual({ planner: "prompt_created" });
    expect(findFirstOrThrow).toHaveBeenCalledWith({
      where: { slug: "lesson-planner" },
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          appId: "lesson-planner",
          slug: "agentic-planner",
          template: "body for planner",
          current: true,
        }),
        update: expect.objectContaining({
          current: true,
        }),
      }),
    );
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          slug: { equals: "agentic-planner" },
          variant: { equals: "main" },
        }),
      }),
    );
  });

  it("creates distinct prompt rows for compound (mode + key stage) variants", async () => {
    const { prisma, findFirst, upsert } = createMockPrisma("prompt_created");
    findFirst.mockResolvedValueOnce(null);

    const result = await resolveAgenticPromptIds({
      prisma,
      templates: [tpl("starterQuiz--default:addOne:ks3")],
    });

    expect(result).toEqual({
      "starterQuiz--default:addOne:ks3": "prompt_created",
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          name: "Agentic Aila: starterQuiz--default:addOne:ks3",
          // cspell:ignore starterquiz addone
          slug: "agentic-starterquiz-default-addone-ks3",
        }),
      }),
    );
  });
});
