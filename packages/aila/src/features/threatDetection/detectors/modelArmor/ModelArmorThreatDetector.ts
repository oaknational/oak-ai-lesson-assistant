import {
  ModelArmorClient,
  createModelArmorAccessTokenProvider,
  toModelArmorThreatDetectionResult,
} from "@oakai/core/src/threatDetection/modelArmor";
import { threatDetectionMessageSchema } from "@oakai/core/src/threatDetection/types";
import { aiLogger } from "@oakai/logger";

import { z } from "zod";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import {
  AilaThreatDetector,
  type ThreatDetectionResult,
} from "../AilaThreatDetector";

const log = aiLogger("aila:threat");

type ThreatMessage = z.infer<typeof threatDetectionMessageSchema>;

export class ModelArmorThreatDetector extends AilaThreatDetector {
  private readonly modelArmorClient: ModelArmorClient;

  constructor() {
    super();

    const projectId = process.env.MODEL_ARMOR_PROJECT_ID;
    const location = process.env.MODEL_ARMOR_LOCATION;
    const templateId = process.env.MODEL_ARMOR_TEMPLATE_ID;

    if (!projectId) {
      throw new Error("MODEL_ARMOR_PROJECT_ID environment variable not set");
    }

    if (!location) {
      throw new Error("MODEL_ARMOR_LOCATION environment variable not set");
    }

    if (!templateId) {
      throw new Error("MODEL_ARMOR_TEMPLATE_ID environment variable not set");
    }

    this.modelArmorClient = new ModelArmorClient({
      defaultTemplateId: templateId,
      getAccessToken: createModelArmorAccessTokenProvider(),
      projectId,
      location,
    });
  }

  protected async authenticate(): Promise<void> {
    return Promise.resolve();
  }

  async detectThreat(content: unknown): Promise<ThreatDetectionResult> {
    log.info("Detecting threat with Model Armor", {
      contentType: typeof content,
      isArray: Array.isArray(content),
      length: Array.isArray(content) ? content.length : 0,
    });

    if (
      !Array.isArray(content) ||
      !content.every((message) => this.isThreatMessage(message))
    ) {
      log.error("Invalid input format for Model Armor", { content });
      throw new Error("Input must be an array of Messages");
    }

    const extractedMessages = extractPromptTextFromMessages(content);
    const prompt = this.getPromptToCheck(extractedMessages);
    const data = await this.modelArmorClient.sanitizeUserPrompt(prompt);
    return toModelArmorThreatDetectionResult(data, prompt);
  }

  async isThreatError(): Promise<boolean> {
    return Promise.resolve(false);
  }

  private buildPrompt(messages: ThreatMessage[]): string {
    return messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");
  }

  private getPromptToCheck(messages: ThreatMessage[]): string {
    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message.role === "user");

    return latestUserMessage?.content ?? this.buildPrompt(messages);
  }

  private isThreatMessage(message: unknown): message is ThreatMessage {
    return threatDetectionMessageSchema.safeParse(message).success;
  }
}
