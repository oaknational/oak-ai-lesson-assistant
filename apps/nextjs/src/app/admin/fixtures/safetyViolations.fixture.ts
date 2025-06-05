import type { SafetyViolation } from "@oakai/db";

// Mock user IDs
export const userIds = {
  withViolations: "user_2nQuq4jFWLfo4w1WNA6xEBp93IY",
  clean: "user_clean123456789",
};

// Mock safety violations for stories and tests
export const mockSafetyViolations: SafetyViolation[] = [
  {
    id: "sv654k0a50007tf413jc6po5f",
    createdAt: new Date("2025-01-20T14:11:26.957Z"),
    updatedAt: new Date("2025-01-20T14:11:26.957Z"),
    userId: userIds.withViolations,
    userAction: "CHAT_MESSAGE",
    detectionSource: "MODERATION",
    recordType: "MODERATION",
    recordId: "cm654k0a50007tf413jc6po5f",
  },
  {
    id: "sv654iz8z0003tf41e42karvo",
    createdAt: new Date("2025-01-20T14:10:38.963Z"),
    updatedAt: new Date("2025-01-20T14:10:38.963Z"),
    userId: userIds.withViolations,
    userAction: "CHAT_MESSAGE",
    detectionSource: "HELICONE",
    recordType: "CHAT_SESSION",
    recordId: "chat_654ito20001tf41k2fbjeu6",
  },
  {
    id: "sv654iz8z0004tf41e42karvp",
    createdAt: new Date("2025-01-20T14:09:38.963Z"),
    updatedAt: new Date("2025-01-20T14:09:38.963Z"),
    userId: userIds.withViolations,
    userAction: "QUIZ_GENERATION",
    detectionSource: "OPENAI",
    recordType: "GENERATION",
    recordId: "gen_654ito20001tf41k2fbjeu7",
  },
  {
    id: "sv654iz8z0005tf41e42karvq",
    createdAt: new Date("2025-01-20T14:08:38.963Z"),
    updatedAt: new Date("2025-01-20T14:08:38.963Z"),
    userId: userIds.withViolations,
    userAction: "CHAT_MESSAGE",
    detectionSource: "THREAT",
    recordType: "CHAT_SESSION",
    recordId: "chat_654ito20001tf41k2fbjeu8",
  },
];

// Mock function for refetching safety violations in stories
export const mockRefetchSafetyViolations = () => {
  return null;
};
