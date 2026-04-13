import type {
  Prisma,
  PrismaClientWithAccelerate,
  ThreatDetection,
} from "@oakai/db";

import type { InputJsonValue } from "@prisma/client/runtime/library";

import { SafetyViolations } from "./safetyViolations";

export type ThreatDetectionCreateInput = {
  appSessionId: string;
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
    const threatDetection = await this.prisma.threatDetection.update({
      where: {
        id,
      },
      data: {
        isFalsePositive: true,
      },
      select: {
        safetyViolationId: true,
      },
    });

    if (!threatDetection.safetyViolationId) {
      return;
    }

    await this.safetyViolations.removeViolationById(
      threatDetection.safetyViolationId,
    );
  }
}
