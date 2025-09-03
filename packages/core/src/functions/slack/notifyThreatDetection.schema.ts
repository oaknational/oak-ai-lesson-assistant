import z from "zod";

export const notifyThreatDetectionSchema = {
  user: z.object({
    id: z.string(),
  }),
  data: z.object({
    id: z.string(),
    threatLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    threatCategory: z.enum([
      "MALWARE",
      "PHISHING", 
      "UNAUTHORIZED_ACCESS",
      "DATA_BREACH",
      "SOCIAL_ENGINEERING",
      "INSIDER_THREAT",
      "DOS_ATTACK",
      "OTHER"
    ]),
    userAction: z.string(),
    detectionTime: z.string(), // ISO timestamp
    systemComponent: z.string(), // Which part of Aila detected the threat
    threatDescription: z.string(),
  }),
};
