import { aiLogger } from "@oakai/logger";
import { applyPatch, deepClone } from "fast-json-patch";
import type { z } from "zod";

import type { ValidPatchDocument } from "../../protocol/jsonPatchProtocol";
import { extractPatches } from "../../protocol/jsonPatchProtocol";
import type { AilaDocumentService, AilaServices } from "../AilaServices";
import type { Message } from "../chat";
import type {
  AilaDocumentContent,
  CategorisationPlugin,
  DocumentPlugin,
} from "./types";

const log = aiLogger("aila:document");

export class AilaDocument implements AilaDocumentService {
  private readonly _aila: AilaServices;
  private _content: AilaDocumentContent = {};
  private _hasInitialisedContentFromMessages = false;
  private readonly _appliedPatches: ValidPatchDocument[] = [];
  private readonly _invalidPatches: ValidPatchDocument[] = [];
  private readonly _plugins: DocumentPlugin[] = [];
  private readonly _categorisationPlugins: CategorisationPlugin[] = [];
  private readonly _schema: z.ZodType<AilaDocumentContent>;

  /**
   * Create a new AilaDocument
   * @param aila The Aila services
   * @param content Initial content (optional)
   * @param plugins Document plugins for document-specific operations
   * @param categorisationPlugins Plugins for content categorisation
   * @param schema Schema for document validation
   */
  public static create({
    aila,
    content,
    plugins = [],
    categorisationPlugins = [],
    schema,
  }: {
    aila: AilaServices;
    content?: AilaDocumentContent;
    plugins?: DocumentPlugin[];
    categorisationPlugins?: CategorisationPlugin[];
    schema: z.ZodType<AilaDocumentContent>;
  }): AilaDocumentService {
    return new AilaDocument({
      aila,
      content,
      plugins,
      categorisationPlugins,
      schema,
    });
  }

  /**
   * Create a new AilaDocument
   */
  constructor({
    aila,
    content,
    plugins = [],
    categorisationPlugins = [],
    schema,
  }: {
    aila: AilaServices;
    content?: AilaDocumentContent;
    plugins?: DocumentPlugin[];
    categorisationPlugins?: CategorisationPlugin[];
    schema: z.ZodType<AilaDocumentContent>;
  }) {
    log.info("Creating AilaDocument");
    this._aila = aila;

    if (content) {
      this._content = content;
    }

    this._plugins = plugins;
    this._categorisationPlugins = categorisationPlugins;
    this._schema = schema;

    for (const plugin of plugins) {
      this.registerPlugin(plugin);
    }

    for (const plugin of categorisationPlugins) {
      this.registerCategorisationPlugin(plugin);
    }
  }

  /**
   * Register a document plugin
   */
  registerPlugin(plugin: DocumentPlugin): void {
    this._plugins.push(plugin);
  }

  /**
   * Register a categorisation plugin
   */
  registerCategorisationPlugin(plugin: CategorisationPlugin): void {
    this._categorisationPlugins.push(plugin);
  }

  /**
   * Get the appropriate plugin for the content
   * Since we now only register one plugin, we just return the first one
   */
  private getPluginForContent(): DocumentPlugin | null {
    return this._plugins[0] || null;
  }

  /**
   * Get the document content
   */
  get content(): AilaDocumentContent {
    return this._content;
  }

  /**
   * Set the document content
   */
  public set content(content: AilaDocumentContent) {
    const validatedContent = this.validateContent(content);
    this._content = validatedContent;
  }

  /**
   * Get whether content has been initialized from messages
   */
  public get hasInitialisedContentFromMessages(): boolean {
    return this._hasInitialisedContentFromMessages;
  }

  /**
   * Get the initial state of the document
   * This returns the current content after initialization from messages.
   * It's used by AilaChat.handleSettingInitialState to enqueue patches
   * for the initial document state.
   */
  public getInitialState(): AilaDocumentContent {
    if (!this._hasInitialisedContentFromMessages) {
      return {} as AilaDocumentContent;
    }

    return this._content
      ? (deepClone(this._content) as AilaDocumentContent)
      : ({} as AilaDocumentContent);
  }

  /**
   * Initialize the document with content
   */
  public initialise(content: AilaDocumentContent) {
    this.content = content;
  }

  /**
   * Apply a set of valid patches to the document content
   */
  public applyValidPatches(validPatches: ValidPatchDocument[]) {
    let workingContent: AilaDocumentContent = deepClone(this._content);

    if (!workingContent) {
      return;
    }

    const beforeKeys = Object.entries(workingContent)
      .filter(([, v]) => v)
      .map(([k]) => k);

    log.info(
      `Applying ${validPatches.length} patches to document with keys: ${beforeKeys.join(
        ", ",
      )}`,
    );

    for (const patch of validPatches) {
      const newContent = this.applyPatchToContent(workingContent, patch);
      if (newContent) {
        workingContent = newContent;
        this._appliedPatches.push(patch);
      } else {
        this._invalidPatches.push(patch);
      }
    }

    const validatedContent = this.validateContent(workingContent);
    if (validatedContent) {
      this._content = validatedContent;
    } else {
      log.warn("Failed to validate content after applying patches");
    }
  }

  /**
   * Apply a patch to the document content
   */
  applyPatchToContent(
    content: AilaDocumentContent,
    patch: ValidPatchDocument,
  ): AilaDocumentContent {
    // Try to use a plugin-specific patch method if available
    const plugin = this.getPluginForContent();
    if (plugin?.applyPatch) {
      const result = plugin.applyPatch(content, patch);
      if (result) {
        return this.validateContent(result);
      }
    }

    // Fall back to generic patch application
    const patchResult = applyPatch(content, [patch.value], true, false);
    return this.validateContent(patchResult.newDocument);
  }

  /**
   * Validate the document content
   */
  private validateContent(content: AilaDocumentContent): AilaDocumentContent {
    try {
      return this._schema.parse(content);
    } catch (error) {
      log.warn("Content validation failed", { error });
      return content;
    }
  }

  /**
   * Extract and apply patches from a string of JSON patches
   */
  public extractAndApplyLlmPatches(patches: string) {
    const { validPatches } = extractPatches(patches);
    this.applyValidPatches(validPatches);
  }

  /**
   * Initialize the document content based on messages.
   * This will use categorisation plugins to analyze messages and create appropriate content.
   */
  public async initialiseContentFromMessages(
    messages: Message[],
  ): Promise<void> {
    if (this._hasInitialisedContentFromMessages || this.hasExistingContent()) {
      this._hasInitialisedContentFromMessages = true;
      return;
    }

    await this.createAndCategoriseNewContent(messages);
  }

  /**
   * Check if the document has existing content
   */
  private hasExistingContent(): boolean {
    return this._content !== null && Object.keys(this._content).length > 0;
  }

  /**
   * Create new content and attempt to categorise it
   */
  private async createAndCategoriseNewContent(
    messages: Message[],
  ): Promise<void> {
    const emptyContent = {} as AilaDocumentContent;

    const wasContentCategorised = await this.attemptContentCategorisation(
      messages,
      emptyContent,
    );

    if (!wasContentCategorised) {
      this._content = emptyContent;
    }

    this._hasInitialisedContentFromMessages = true;
  }

  /**
   * Try to categorise content using available plugins
   * @returns true if content was successfully categorised
   */
  private async attemptContentCategorisation(
    messages: Message[],
    contentToCategorisе: AilaDocumentContent,
  ): Promise<boolean> {
    for (const plugin of this._categorisationPlugins) {
      if (plugin.shouldCategorise(contentToCategorisе)) {
        const categorisedContent = await plugin.categoriseFromMessages(
          messages,
          contentToCategorisе,
        );

        if (categorisedContent) {
          this._content = categorisedContent;
          return true;
        }
      }
    }

    return false;
  }
}
