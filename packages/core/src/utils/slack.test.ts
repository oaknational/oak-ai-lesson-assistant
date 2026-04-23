import type * as SlackModule from "./slack";

describe("slack utils", () => {
  beforeAll(() => {
    process.env.SLACK_NOTIFICATION_CHANNEL_ID = "slack-channel";
    process.env.SLACK_AI_OPS_NOTIFICATION_CHANNEL_ID = "slack-ai-ops-channel";
    process.env.SLACK_BOT_USER_OAUTH_TOKEN = "token";
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT = "posthog-project";
    process.env.NEXT_PUBLIC_CLERK_INSTANCE = "clerk-instance";
    process.env.NEXT_PUBLIC_CLERK_APP_ID = "clerk-app";
  });

  afterEach(() => {
    jest.resetModules();
  });

  async function loadSlackModule(): Promise<typeof SlackModule> {
    return import("./slack");
  }

  it("truncates header text to Slack's header limit", async () => {
    const { createHeaderBlock, slackTextLimits } = await loadSlackModule();

    const header = createHeaderBlock(
      "x".repeat(slackTextLimits.headerText + 50),
    );

    expect(header.text.text).toHaveLength(slackTextLimits.headerText);
    expect(header.text.text.endsWith("... [truncated]")).toBe(true);
  });

  it("keeps threat metadata visible when the user input is too long", async () => {
    const { createThreatSectionBlock, slackTextLimits } =
      await loadSlackModule();

    const block = createThreatSectionBlock({
      id: "interaction-123",
      userInput: "x".repeat(5000),
      detectedThreats: [
        { detectorType: "prompt_injection", detectorId: "detector-123" },
      ],
      requestId: "request-123",
      userAction: "CHAT_SESSION",
    });

    const detailsField = block.fields?.[1];

    expect(detailsField?.text.length).toBeLessThanOrEqual(
      slackTextLimits.sectionFieldText,
    );
    expect(detailsField?.text).toContain("*Detected Threats:*");
    expect(detailsField?.text).toContain("request-123");
    expect(detailsField?.text).toContain("... [truncated]");
  });

  it("truncates long moderation justifications to Slack's field limit", async () => {
    const { createModerationSectionBlock, slackTextLimits } =
      await loadSlackModule();

    const block = createModerationSectionBlock({
      id: "interaction-123",
      justification: "y".repeat(5000),
      categories: ["violence"],
      userAction: "PARTIAL_LESSON_GENERATION",
      violationType: "MODERATION",
    });

    const justificationField = block.fields?.[1];

    expect(justificationField?.text.length).toBeLessThanOrEqual(
      slackTextLimits.sectionFieldText,
    );
    expect(justificationField?.text.startsWith("*Justification*: ")).toBe(true);
    expect(justificationField?.text.endsWith("... [truncated]")).toBe(true);
  });
});
