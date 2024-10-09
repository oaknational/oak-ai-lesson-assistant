import { Aila, AilaInitializationOptions } from ".";
import { MockCategoriser } from "../features/categorisation/categorisers/MockCategoriser";
import { checkLastMessage, expectPatch, expectText } from "./Aila.testHelpers";

const runInCI = process.env.CI === "true";
const runManually = process.env.RUN_LLM_TESTS === "true";

(runInCI || runManually ? describe : describe.skip)(
  "Aila with live OpenAI requests about a subject and key stage we don't cover",
  () => {
    let ailaInstance: Aila;

    beforeEach(() => {
      ailaInstance = new Aila({
        lessonPlan: {},
        chat: { id: "test-chat", userId: "test-user" },
        options: {
          usePersistence: false,
          useRag: false,
          useAnalytics: false,
          useModeration: false,
        },
        plugins: [],
        services: {
          chatCategoriser: new MockCategoriser({
            mockedLessonPlan: {
              keyStage: "specialist",
              subject: "design-technology",
              title: "Motorcycle Maintenance",
              topic: "Basics and Advanced Techniques",
            },
          }),
        },
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
      const secondParsedMessage = checkLastMessage(ailaInstance);

      await ailaInstance.generateSync({ input: "Continue" });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const thirdParsedMessage = checkLastMessage(ailaInstance);

      // Check that the title is set appropriately
      expect(ailaInstance.lesson.plan.title).toBeDefined();
    }, 30000);
  },
);

(runInCI || runManually ? describe : describe.skip)(
  "Aila with live OpenAI requests about a subject and key stage we cover",
  () => {
    let ailaInstance: Aila;

    beforeEach(() => {
      const options: AilaInitializationOptions = {
        lessonPlan: {},
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
        services: {
          chatCategoriser: new MockCategoriser({
            mockedLessonPlan: {
              keyStage: "key-stage-3",
              subject: "geography",
              title: "Glaciation",
              topic: "The Formation of Glacial Landscapes",
            },
          }),
        },
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

      expect(ailaInstance.lesson.plan.title).toBeDefined();
      expect(ailaInstance.lesson.plan.title?.toLowerCase()).toContain(
        "glaciation",
      );
    }, 30000);
  },
);
