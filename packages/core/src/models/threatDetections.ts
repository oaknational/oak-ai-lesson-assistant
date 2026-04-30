import type {
  Prisma,
  PrismaClientWithAccelerate,
  SafetyViolationRecordType,
  ThreatDetection,
} from "@oakai/db";

import type { InputJsonValue } from "@prisma/client/runtime/library";

import { SafetyViolations } from "./safetyViolations";

export type ThreatDetectionCreateInput = {
  appSessionId?: string;
  recordType: SafetyViolationRecordType;
  recordId: string;
  messageId?: string;
  userId: string;
  threateningMessage: string;
  provider: string;
  category?: string;
  severity?: string;
  providerResponse?: InputJsonValue;
  isFalsePositive?: boolean;
  safetyViolationId?: string;
};

export type ThreatDetectionWithSafetyViolation =
  Prisma.ThreatDetectionGetPayload<{
    include: {
      safetyViolation: true;
    };
  }>;

export class ThreatDetections {
  private readonly safetyViolations: SafetyViolations;

  constructor(
    private readonly prisma: PrismaClientWithAccelerate,
    safetyViolations?: SafetyViolations,
  ) {
    this.safetyViolations = safetyViolations ?? new SafetyViolations(prisma);
  }

  async create({
    appSessionId,
    recordType,
    recordId,
    messageId,
    userId,
    threateningMessage,
    provider,
    category,
    severity,
    providerResponse,
    isFalsePositive = false,
    safetyViolationId,
  }: ThreatDetectionCreateInput): Promise<ThreatDetection> {
    return this.prisma.threatDetection.create({
      data: {
        appSessionId,
        recordType,
        recordId,
        messageId,
        userId,
        threateningMessage,
        provider,
        category,
        severity,
        providerResponse,
        isFalsePositive,
        safetyViolationId,
      },
    });
  }

  async byUserId(
    userId: string,
  ): Promise<ThreatDetectionWithSafetyViolation[]> {
    return this.prisma.threatDetection.findMany({
      where: {
        userId,
      },
      include: {
        safetyViolation: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async markFalsePositive(id: string): Promise<void> {
    const threatDetection = await this.prisma.$transaction(async (tx) => {
      const detection = await tx.threatDetection.findUniqueOrThrow({
        where: {
          id,
        },
        select: {
          safetyViolationId: true,
          userId: true,
        },
      });

      if (detection.safetyViolationId) {
        await tx.safetyViolation.deleteMany({
          where: {
            id: detection.safetyViolationId,
          },
        });
      }

      await tx.threatDetection.update({
        where: {
          id,
        },
        data: {
          isFalsePositive: true,
          safetyViolationId: null,
        },
      });

      return detection;
    });

    if (!threatDetection.safetyViolationId) {
      return;
    }

    await this.safetyViolations.conditionallyUnbanUser(threatDetection.userId);
  }
}
