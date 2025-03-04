import { aiLogger } from "@oakai/logger";
import type { z } from "zod";

import type { Message } from "../chat";
import { LessonPlanSchema } from "./schemas/lessonPlan";
import type { AilaDocumentContent, CategorisationPlugin } from "./types";

const log = aiLogger("aila");

// Create a simplified version of AilaDocument for testing without circular references
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

      if (plugin.shouldCategorise(contentToCategorisе)) {
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
      console.log("Starting basic test");

      // Create the document with initial content
      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      console.log("Creating document");
      const document = new TestDocument({
        content: initialContent,
        categorisationPlugins: [],
        schema: LessonPlanSchema,
      });

      console.log("Checking content");
      // Check that the content was set correctly
      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
      console.log("Basic test completed");
    });

    it("should not change content when initialising from messages with no categorisation plugins", async () => {
      console.log("Starting test with initialiseContentFromMessages");

      // Create the document with initial content
      const initialContent: AilaDocumentContent = {
        keyStage: "key-stage-2",
        subject: "history",
        title: "Roman Britain",
      };

      console.log("Creating document");
      const document = new TestDocument({
        content: initialContent,
        categorisationPlugins: [], // No categorisation plugins
        schema: LessonPlanSchema,
      });

      // Create some test messages
      const messages: Message[] = [
        {
          role: "user",
          content:
            "I need a lesson plan about Roman Britain for year 4 history",
          id: "test-message-1",
        },
      ];

      console.log("Calling initialiseContentFromMessages");
      // Initialize content from messages
      await document.initialiseContentFromMessages(messages);

      console.log("Checking content after initialisation");
      // Check that the content was not changed
      expect(document.content.title).toBe("Roman Britain");
      expect(document.content.subject).toBe("history");
      expect(document.content.keyStage).toBe("key-stage-2");
      console.log("Test with initialiseContentFromMessages completed");
    });

    it("should use a minimal categorisation plugin", async () => {
      console.log("Starting test with categorisation plugin");

      // Track if methods were called
      let shouldCategoriseCalled = false;
      let categoriseFromMessagesCalled = false;

      console.log("Creating minimal plugin");
      // Create a minimal categorisation plugin without Jest mocks
      const minimalPlugin: CategorisationPlugin = {
        id: "minimal-plugin",
        shouldCategorise: (content) => {
          console.log(
            "shouldCategorise called with content:",
            JSON.stringify(content),
          );
          shouldCategoriseCalled = true;
          return true;
        },
        categoriseFromMessages: async (messages, content) => {
          console.log(
            "categoriseFromMessages called with messages:",
            messages.length,
          );
          console.log(
            "categoriseFromMessages called with content:",
            JSON.stringify(content),
          );
          categoriseFromMessagesCalled = true;
          return {
            keyStage: "key-stage-3",
            subject: "science",
            title: "The Solar System",
          };
        },
      };

      console.log("Creating document with plugin");
      // Create the document with empty content
      const document = new TestDocument({
        content: {},
        categorisationPlugins: [minimalPlugin],
        schema: LessonPlanSchema,
      });

      // Create some test messages
      const messages: Message[] = [
        {
          role: "user",
          content: "I need a lesson plan about the solar system",
          id: "test-message-1",
        },
      ];

      console.log("Calling initialiseContentFromMessages with plugin");
      try {
        // Initialize content from messages
        await document.initialiseContentFromMessages(messages);
        console.log("initialiseContentFromMessages completed successfully");
      } catch (error) {
        console.error("Error in initialiseContentFromMessages:", error);
        throw error;
      }

      console.log("Checking if methods were called");
      // Check that the plugin methods were called
      expect(shouldCategoriseCalled).toBe(true);
      expect(categoriseFromMessagesCalled).toBe(true);

      console.log("Checking content after categorisation");
      // Check that the content was updated
      expect(document.content.title).toBe("The Solar System");
      expect(document.content.subject).toBe("science");
      expect(document.content.keyStage).toBe("key-stage-3");
      console.log("Test with categorisation plugin completed");
    });
  });
});
