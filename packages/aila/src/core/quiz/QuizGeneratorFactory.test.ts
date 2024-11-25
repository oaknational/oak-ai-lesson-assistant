import { AilaQuizFactory } from "./AilaQuizGeneratorFactory";
import { AilaRagQuizGenerator } from "./AilaRagQuizGenerator";
import { BasedOnRagQuizGenerator } from "./BasedOnRagQuizGenerator";
import { MLQuizGenerator } from "./MLQuizGenerator";

describe("AilaQuizFactory", () => {
  it("should create a RAG quiz generator", () => {
    const generator = AilaQuizFactory.createQuizGenerator("rag");
    expect(generator).toBeInstanceOf(AilaRagQuizGenerator);
  });

  it("should create an ML quiz generator", () => {
    const generator = AilaQuizFactory.createQuizGenerator("ml");
    expect(generator).toBeInstanceOf(MLQuizGenerator);
  });

  it("should create a BasedOnRag quiz generator", () => {
    const generator = AilaQuizFactory.createQuizGenerator("basedOnRag");
    expect(generator).toBeInstanceOf(BasedOnRagQuizGenerator);
  });

  it("should throw error for invalid quiz generator type", () => {
    // @ts-expect-error Testing invalid type
    expect(() => AilaQuizFactory.createQuizGenerator("invalid")).toThrow(
      "Unknown quiz generator type: invalid",
    );
  });
});
