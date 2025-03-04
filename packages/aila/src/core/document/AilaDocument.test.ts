import type { Message } from "../chat";
import { AilaDocument } from "./AilaDocument";
import { LessonPlanCategorisationPlugin } from "./plugins/LessonPlanCategorisationPlugin";
import { LessonPlanSchema } from "./schemas/lessonPlan";
import type { AilaDocumentContent, CategorisationPlugin } from "./types";

describe("AilaDocument", () => {
  describe("constructor", () => {
    it("should initialize with provided content", () => {
      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      const document = new AilaDocument({
        content: initialContent,
        schema: LessonPlanSchema,
      });

      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
    });
  });

  describe("initialiseContentFromMessages", () => {
    it("should not change content when content already exists", async () => {
      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      const document = new AilaDocument({
        content: initialContent,
        schema: LessonPlanSchema,
      });

      const messages: Message[] = [
        {
          role: "user",
          content:
            "I need a lesson plan about Roman Britain for year 4 history",
          id: "test-message-1",
        },
      ];

      await document.initialiseContentFromMessages(messages);

      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
    });

    it("should use categorisation plugin when content is empty", async () => {
      const categoriseFromMessages = jest.fn().mockResolvedValue({
        keyStage: "key-stage-3",
        subject: "science",
        title: "The Solar System",
      });

      const shouldCategorise = jest.fn().mockReturnValue(true);

      const minimalPlugin: CategorisationPlugin = {
        id: "minimal-plugin",
        shouldCategorise,
        categoriseFromMessages,
      };

      const document = new AilaDocument({
        content: {},
        categorisationPlugins: [minimalPlugin],
        schema: LessonPlanSchema,
      });

      const messages: Message[] = [
        {
          role: "user",
          content: "I need a lesson plan about the solar system",
          id: "test-message-1",
        },
      ];

      await document.initialiseContentFromMessages(messages);

      expect(shouldCategorise).toHaveBeenCalled();
      expect(categoriseFromMessages).toHaveBeenCalled();
      expect(document.content.title).toBe("The Solar System");
      expect(document.content.subject).toBe("science");
      expect(document.content.keyStage).toBe("key-stage-3");
    });

    it("should not call categoriseFromMessages when shouldCategorise returns false", async () => {
      const categoriseFromMessages = jest.fn();
      const shouldCategorise = jest.fn().mockReturnValue(false);

      const plugin: CategorisationPlugin = {
        id: "test-plugin",
        shouldCategorise,
        categoriseFromMessages,
      };

      const document = new AilaDocument({
        content: {},
        categorisationPlugins: [plugin],
        schema: LessonPlanSchema,
      });

      const messages: Message[] = [
        {
          role: "user",
          content: "Test message",
          id: "test-message-1",
        },
      ];

      await document.initialiseContentFromMessages(messages);

      expect(shouldCategorise).toHaveBeenCalled();
      expect(categoriseFromMessages).not.toHaveBeenCalled();
    });

    it("should handle missing shouldCategorise method by always categorizing", async () => {
      const categoriseFromMessages = jest.fn().mockResolvedValue({
        title: "Test Title",
        subject: "Test Subject",
        keyStage: "key-stage-1",
      });

      const plugin: CategorisationPlugin = {
        id: "test-plugin",
        categoriseFromMessages,
      };

      const document = new AilaDocument({
        content: {},
        categorisationPlugins: [plugin],
        schema: LessonPlanSchema,
      });

      const messages: Message[] = [
        {
          role: "user",
          content: "Test message",
          id: "test-message-1",
        },
      ];

      await document.initialiseContentFromMessages(messages);

      expect(categoriseFromMessages).toHaveBeenCalled();
      expect(document.content.title).toBe("Test Title");
    });
  });

  describe("LessonPlanCategorisationPlugin", () => {
    it("should categorize when all essential fields are missing", () => {
      const mockCategoriser = { categorise: jest.fn() };
      const plugin = new LessonPlanCategorisationPlugin(mockCategoriser);

      const emptyContent: AilaDocumentContent = {};
      expect(plugin.shouldCategorise(emptyContent)).toBe(true);
    });

    it("should categorize when some essential fields are missing", () => {
      const mockCategoriser = { categorise: jest.fn() };
      const plugin = new LessonPlanCategorisationPlugin(mockCategoriser);

      const partialContent: AilaDocumentContent = { title: "Roman Britain" };
      expect(plugin.shouldCategorise(partialContent)).toBe(true);
    });

    it("should not categorize when all essential fields are present", () => {
      const mockCategoriser = { categorise: jest.fn() };
      const plugin = new LessonPlanCategorisationPlugin(mockCategoriser);

      const completeContent: AilaDocumentContent = {
        title: "Roman Britain",
        subject: "history",
        keyStage: "key-stage-2",
      };
      expect(plugin.shouldCategorise(completeContent)).toBe(false);
    });
  });
});
