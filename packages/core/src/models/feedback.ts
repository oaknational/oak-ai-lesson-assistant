import type {
  GenerationUserFlag,
  PrismaClientWithAccelerate,
  ReGeneration,
  UserTweak,
} from "@oakai/db";

export class Feedback {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  recordReGeneration(
    previousGenerationId: string,
    appSessionId: string,
    replacementGenerationId: string,
  ): Promise<ReGeneration> {
    return this.prisma.reGeneration.create({
      data: {
        previousGenerationId,
        replacementGenerationId,
        appSessionId,
      },
    });
  }

  recordUserTweak(
    generationId: string,
    appSessionId: string,
    tweakedValue: string,
    originalValue: string,
  ): Promise<UserTweak> {
    return this.prisma.userTweak.create({
      data: {
        generationId,
        appSessionId,
        tweakedValue,
        originalValue,
      },
    });
  }

  recordUserFlag(
    generationId: string,
    appSessionId: string,
    feedbackMessage: string,
    feedbackValue: string,
    flags: {
      isInappropriate: boolean;
      isIncorrect: boolean;
      isUnhelpful: boolean;
    },
  ): Promise<GenerationUserFlag> {
    return this.prisma.generationUserFlag.create({
      data: {
        generationId,
        appSessionId,
        feedbackMessage,
        feedbackValue,
        feedbackReasons: flags,
      },
    });
  }
}
