import type { Message } from "../../../core/chat";
import type { AilaDocumentContent } from "../../../core/document/types";
import type { AilaCategorisationFeature } from "../../types";

export class MockCategoriser implements AilaCategorisationFeature {
  private readonly _mockedContent: AilaDocumentContent | undefined;
  constructor({
    mockedContent,
  }: {
    mockedContent: AilaDocumentContent | undefined;
  }) {
    this._mockedContent = mockedContent;
  }
  public async categorise<T extends AilaDocumentContent>(
    messages?: Message[],
    currentContent?: AilaDocumentContent,
  ): Promise<T | undefined> {
    // Cast is because we're returning a predefined value
    return Promise.resolve(this._mockedContent as T | undefined);
  }
}
