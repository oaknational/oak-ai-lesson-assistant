import {
  ModelArmorClient,
  createModelArmorAccessTokenProvider,
  toModelArmorThreatDetectionResult,
} from "@oakai/core/src/threatDetection/modelArmor";
import { aiLogger } from "@oakai/logger";

import invariant from "tiny-invariant";

import { extractPromptTextFromMessages } from "../../../../utils/extractPromptTextFromMessages";
import { AilaThreatDetector } from "../AilaThreatDetector";
import type {
  ThreatDetectionMessage,
  ThreatDetectionResult,
} from "../AilaThreatDetector";

const log = aiLogger("aila:threat");

export class ModelArmorThreatDetector extends AilaThreatDetector {
  private readonly modelArmorClient: ModelArmorClient;

  constructor() {
    super();

    const projectId = process.env.MODEL_ARMOR_PROJECT_ID;
    const location = process.env.MODEL_ARMOR_LOCATION;
    const templateId = process.env.MODEL_ARMOR_TEMPLATE_ID;

    invariant(projectId, "MODEL_ARMOR_PROJECT_ID environment variable not set");
    invariant(location, "MODEL_ARMOR_LOCATION environment variable not set");
    invariant(
      templateId,
      "MODEL_ARMOR_TEMPLATE_ID environment variable not set",
    );

    this.modelArmorClient = new ModelArmorClient({
      defaultTemplateId: templateId,
      getAccessToken: createModelArmorAccessTokenProvider(),
      projectId,
      location,
    });
  }

  async detectThreat(
    content: ThreatDetectionMessage[],
  ): Promise<ThreatDetectionResult> {
    log.info("Detecting threat with Model Armor", {
      length: content.length,
    });

    const extractedMessages = extractPromptTextFromMessages(content);
    const prompt = this.getPromptToCheck(extractedMessages);
    const data = await this.modelArmorClient.sanitizeUserPrompt(prompt);
    return toModelArmorThreatDetectionResult(data, prompt);
  }

  private buildPrompt(messages: ThreatDetectionMessage[]): string {
    return messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");
  }

  private getPromptToCheck(messages: ThreatDetectionMessage[]): string {
    const latestUserMessage = messages.findLast(
      (message) => message.role === "user",
    );

    return latestUserMessage?.content ?? this.buildPrompt(messages);
  }
}
