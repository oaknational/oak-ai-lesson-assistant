import type {
  Generation,
  ModerationType,
  Prisma,
  PrismaClientWithAccelerate} from "@oakai/db";
import {
  GenerationStatus
} from "@oakai/db";
import type { StructuredLogger } from "@oakai/logger";
import { structuredLogger } from "@oakai/logger";
import type { Logger as InngestLogger } from "inngest/middleware/logger";
import { omit } from "remeda";
import { Md5 } from "ts-md5";

export type PromptInputs = {
  [key: string]: unknown | undefined;
  fact?: string;
  knowledge?: string;
  transcript?: string;
};

export class Generations {
  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    // inngest's logger doesn't allow child logger creation, so make
    // sure we accept instances of that too
    private readonly logger:
      | StructuredLogger
      | InngestLogger = structuredLogger,
  ) {}

  async byId(generationId: string): Promise<Generation | null> {
    return this.prisma.generation.findFirst({
      where: {
        id: generationId,
      },
    });
  }

  async createRequest(
    appId: string,
    promptId: string,
    appSessionId: string,
    userId: string,
  ): Promise<Generation> {
    return this.prisma.generation.create({
      data: {
        appId,
        appSessionId,
        promptId,
        userId,
        status: GenerationStatus.REQUESTED,
      },
    });
  }

  async update(
    generationId: string,
    updateData: Prisma.GenerationUpdateInput,
  ): Promise<Generation> {
    return this.prisma.generation.update({
      where: { id: generationId },
      data: updateData,
    });
  }

  async setStatus(
    generationId: string,
    status: GenerationStatus,
  ): Promise<Generation> {
    return this.prisma.generation.update({
      where: { id: generationId },
      data: {
        status,
      },
    });
  }

  isFinished(generation: Generation): boolean {
    return (
      generation.status === GenerationStatus.FAILED ||
      generation.status === GenerationStatus.FLAGGED ||
      generation.status === GenerationStatus.SUCCESS
    );
  }

  async completeGeneration(
    generationId: string,
    response: Prisma.InputJsonValue,
    additional?: Prisma.GenerationUpdateInput,
  ): Promise<Generation> {
    return this.update(generationId, {
      status: GenerationStatus.SUCCESS,
      response,
      completedAt: new Date(),
      ...additional,
    });
  }

  async failGeneration(
    generationId: string,
    errorMessage: string,
    additional?: Prisma.GenerationUpdateInput,
  ): Promise<Generation> {
    return this.update(generationId, {
      status: GenerationStatus.FAILED,
      error: errorMessage,
      completedAt: new Date(),
      ...additional,
    });
  }

  async flagGeneration(
    generationId: string,
    errorMessage: string,
    moderationType: ModerationType,
    additional?: Prisma.GenerationUpdateInput,
  ): Promise<Generation> {
    return this.update(generationId, {
      status: GenerationStatus.FLAGGED,
      error: errorMessage,
      moderationType,
      completedAt: new Date(),
      ...additional,
    });
  }

  generatePromptInputsHash(promptInputs: PromptInputs): string {
    const promptInputsHashKeys = Object.keys(
      omit(promptInputs, ["sessionId", "transcript", "fact", "knowledge"]),
    ).sort((a, b) => a.localeCompare(b));

    const hashInput = promptInputsHashKeys
      .map((k) => {
        return JSON.stringify(promptInputs[k]);
      })
      .join("---");

    const promptInputsHash = Md5.hashStr(hashInput);
    return promptInputsHash;
  }

  async getPriorSuccessfulGeneration(
    promptId: string,
    promptInputs: PromptInputs,
  ): Promise<Generation | null> {
    const promptInputsHash = this.generatePromptInputsHash(promptInputs);
    return this.prisma.generation.findFirst({
      where: {
        promptId,
        status: "SUCCESS",
        promptInputsHash,
      },
    });
  }
}
