import { aiLogger } from "@oakai/logger";
import type { z } from "zod";

import type { Message } from "../chat";
import { LessonPlanSchema } from "./schemas/lessonPlan";
import type { AilaDocumentContent, CategorisationPlugin } from "./types";

const log = aiLogger("aila");

class TestDocument {
  private _content: AilaDocumentContent = {};
  private _hasInitialisedContentFromMessages = false;
  private readonly _categorisationPlugins: CategorisationPlugin[] = [];
  private readonly _schema: z.ZodType<AilaDocumentContent>;

  constructor({
    content,
    categorisationPlugins = [],
    schema,
  }: {
    content?: AilaDocumentContent;
    categorisationPlugins?: CategorisationPlugin[];
    schema: z.ZodType<AilaDocumentContent>;
  }) {
    log.info("Creating TestDocument");

    if (content) {
      this._content = content;
    }

    this._categorisationPlugins = categorisationPlugins;
    this._schema = schema;
  }

  get content(): AilaDocumentContent {
    return this._content;
  }

  get hasInitialisedContentFromMessages(): boolean {
    return this._hasInitialisedContentFromMessages;
  }

  private hasExistingContent(): boolean {
    const hasContent =
      this._content !== null && Object.keys(this._content).length > 0;
    log.info("hasExistingContent check", {
      hasContent,
      contentKeys: this._content ? Object.keys(this._content) : [],
    });
    return hasContent;
  }

  public async initialiseContentFromMessages(
    messages: Message[],
  ): Promise<void> {
    log.info("initialiseContentFromMessages called", {
      hasInitialisedContentFromMessages:
        this._hasInitialisedContentFromMessages,
      hasExistingContent: this.hasExistingContent(),
      messageCount: messages.length,
    });

    if (this._hasInitialisedContentFromMessages || this.hasExistingContent()) {
      this._hasInitialisedContentFromMessages = true;
      return;
    }

    await this.createAndCategoriseNewContent(messages);
  }

  private async createAndCategoriseNewContent(
    messages: Message[],
  ): Promise<void> {
    log.info("createAndCategoriseNewContent called", {
      messageCount: messages.length,
      pluginCount: this._categorisationPlugins.length,
    });

    const emptyContent = {} as AilaDocumentContent;

    const wasContentCategorised = await this.attemptContentCategorisation(
      messages,
      emptyContent,
    );

    log.info("createAndCategoriseNewContent result", {
      wasContentCategorised,
      resultContentKeys: Object.keys(this._content),
    });

    if (!wasContentCategorised) {
      this._content = emptyContent;
    }

    this._hasInitialisedContentFromMessages = true;
  }

  private async attemptContentCategorisation(
    messages: Message[],
    contentToCategorisе: AilaDocumentContent,
  ): Promise<boolean> {
    log.info("attemptContentCategorisation called", {
      messageCount: messages.length,
      pluginCount: this._categorisationPlugins.length,
      pluginTypes: this._categorisationPlugins.map((p) => p.id),
    });

    for (const plugin of this._categorisationPlugins) {
      log.info(`Checking plugin ${plugin.id} for categorisation`);

      if (
        !plugin.shouldCategorise ||
        plugin.shouldCategorise(contentToCategorisе)
      ) {
        log.info(`Plugin ${plugin.id} will attempt categorisation`);

        try {
          const categorisedContent = await plugin.categoriseFromMessages(
            messages,
            contentToCategorisе,
          );

          if (categorisedContent) {
            log.info(`Plugin ${plugin.id} successfully categorised content`, {
              resultKeys: Object.keys(categorisedContent),
            });
            this._content = categorisedContent;
            return true;
          } else {
            log.info(`Plugin ${plugin.id} failed to categorise content`);
          }
        } catch (error) {
          log.error(`Error in plugin ${plugin.id}:`, error);
        }
      } else {
        log.info(`Plugin ${plugin.id} will not categorise content`);
      }
    }

    return false;
  }
}

describe("Document Tests", () => {
  describe("basic functionality", () => {
    it("should create a document with initial content", () => {
      log.info("Starting basic test");

      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      log.info("Creating document");
      const document = new TestDocument({
        content: initialContent,
        categorisationPlugins: [],
        schema: LessonPlanSchema,
      });

      log.info("Checking content");
      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
      log.info("Basic test completed");
    });

    it("should not change content when initialising from messages with no categorisation plugins", async () => {
      log.info("Starting test with initialiseContentFromMessages");

      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      log.info("Creating document");
      const document = new TestDocument({
        content: initialContent,
        categorisationPlugins: [],
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

      log.info("Calling initialiseContentFromMessages");
      await document.initialiseContentFromMessages(messages);

      log.info("Checking content after initialisation");
      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
      log.info("Test with initialiseContentFromMessages completed");
    });

    it("should use a minimal categorisation plugin", async () => {
      log.info("Starting test with categorisation plugin");

      let shouldCategoriseCalled = false;
      let categoriseFromMessagesCalled = false;

      log.info("Creating minimal plugin");
      const minimalPlugin: CategorisationPlugin = {
        id: "minimal-plugin",
        shouldCategorise: (content) => {
          log.info(
            "shouldCategorise called with content:",
            JSON.stringify(content),
          );
          shouldCategoriseCalled = true;
          return true;
        },
        categoriseFromMessages: async (messages, content) => {
          log.info(
            "categoriseFromMessages called with messages:",
            messages.length,
          );
          log.info(
            "categoriseFromMessages called with content:",
            JSON.stringify(content),
          );
          categoriseFromMessagesCalled = true;
          return Promise.resolve({
            keyStage: "key-stage-3",
            subject: "science",
            title: "The Solar System",
          });
        },
      };

      log.info("Creating document with plugin");
      const document = new TestDocument({
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

      log.info("Calling initialiseContentFromMessages with plugin");
      try {
        await document.initialiseContentFromMessages(messages);
        log.info("initialiseContentFromMessages completed successfully");
      } catch (error) {
        log.error("Error in initialiseContentFromMessages:", error);
        throw error;
      }

      log.info("Checking if methods were called");
      expect(shouldCategoriseCalled).toBe(true);
      expect(categoriseFromMessagesCalled).toBe(true);

      log.info("Checking content after categorisation");
      expect(document.content.title).toBe("The Solar System");
      expect(document.content.subject).toBe("science");
      expect(document.content.keyStage).toBe("key-stage-3");
      log.info("Test with categorisation plugin completed");
    });
  });
});
