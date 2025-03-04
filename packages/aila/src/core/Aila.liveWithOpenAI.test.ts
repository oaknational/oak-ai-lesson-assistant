import { MockCategoriser } from "../features/categorisation/categorisers/MockCategoriser";
import { Aila } from "./Aila";
import { checkLastMessage, expectPatch, expectText } from "./Aila.testHelpers";
import { LessonPlanCategorisationPlugin } from "./document/plugins/LessonPlanCategorisationPlugin";
import { LessonPlanSchema } from "./document/schemas/lessonPlan";
import type { AilaInitializationOptions } from "./types";

const runInCI = process.env.CI === "true";
const runManually = process.env.RUN_LLM_TESTS === "true";

(runInCI || runManually ? describe : describe.skip)(
  "Aila with live OpenAI requests about a subject and key stage we don't cover",
  () => {
    let ailaInstance: Aila;

    beforeEach(() => {
      ailaInstance = new Aila({
        document: {
          content: {},
          schema: LessonPlanSchema,
          categorisationPlugin: () =>
            new LessonPlanCategorisationPlugin(
              new MockCategoriser({
                mockedContent: {
                  keyStage: "specialist",
                  subject: "design-technology",
                  title: "Motorcycle Maintenance",
                  topic: "Basics and Advanced Techniques",
                },
              }),
            ),
        },
        chat: { id: "test-chat", userId: "test-user" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
      });
    });

    it.skip("should respond with edits and set title for a lesson about Motorcycle Maintenance", async () => {
      // This test is failing because it generates backtick JSON in the output
      // and does not set the title correctly
      const userInput =
        "Make a lesson about Motorcycle Maintenance for Degree Level Students";

      await ailaInstance.generateSync({ input: userInput });

      const firstParsedMessage = checkLastMessage(ailaInstance);

      expectText(firstParsedMessage, "I can't find any existing Oak lessons");

      await ailaInstance.generateSync({ input: "Continue" });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _secondParsedMessage = checkLastMessage(ailaInstance);

      await ailaInstance.generateSync({ input: "Continue" });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _thirdParsedMessage = checkLastMessage(ailaInstance);

      // Check that the title is set appropriately
      expect(ailaInstance.document.content.title).toBeDefined();
    }, 30000);
  },
);

(runInCI || runManually ? describe : describe.skip)(
  "Aila with live OpenAI requests about a subject and key stage we cover",
  () => {
    let ailaInstance: Aila;

    beforeEach(() => {
      const options: AilaInitializationOptions = {
        document: {
          content: {},
          schema: LessonPlanSchema,
          categorisationPlugin: () =>
            new LessonPlanCategorisationPlugin(
              new MockCategoriser({
                mockedContent: {
                  keyStage: "key-stage-3",
                  subject: "geography",
                  title: "Glaciation",
                  topic: "The Formation of Glacial Landscapes",
                },
              }),
            ),
        },
        chat: { id: "test-chat", userId: "test-user" },
        options: {
          usePersistence: false,
          useRag: true,
          useAnalytics: false,
          useModeration: false,
          useThreatDetection: false,
          useErrorReporting: false,
        },
        plugins: [],
      };
      ailaInstance = new Aila(options);
    });
    it.skip("should respond with edits and set title for a lesson about Glaciation", async () => {
      // This test is failing because it asks for confirmation and outputs markdown content
      const userInput = "Make a lesson about Glaciation";

      await ailaInstance.generateSync({ input: userInput });

      const firstParsedMessage = checkLastMessage(ailaInstance);

      expectText(firstParsedMessage, "I can't find any existing Oak lessons");

      await ailaInstance.generateSync({ input: "Continue" });
      const secondParsedMessage = checkLastMessage(ailaInstance);

      // We don't want markdown titles in the response - it signifies it's generating
      // the content in the response rather than in patches
      expect(secondParsedMessage).not.toContainEqual(
        expect.objectContaining({
          type: "text",
          value: expect.stringContaining("## Learning Outcome"),
        }),
      );
      expectPatch(secondParsedMessage, "replace", "/title");

      expect(ailaInstance.document.content.title).toBeDefined();
      expect(ailaInstance.document.content.title?.toLowerCase()).toContain(
        "glaciation",
      );
    }, 30000);
  },
);
