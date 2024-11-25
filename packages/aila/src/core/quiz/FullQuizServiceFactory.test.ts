import { SimpleFullQuizService } from "./BaseFullQuizService";
import { FullQuizServiceFactory } from "./FullQuizServiceFactory";

describe("FullQuizServiceFactory", () => {
  let factory: FullQuizServiceFactory;

  beforeEach(() => {
    factory = new FullQuizServiceFactory();
  });

  it('should create SimpleFullQuizService when settings is "simple"', () => {
    const service = factory.create("simple");
    expect(service).toBeInstanceOf(SimpleFullQuizService);
  });

  it("should throw error for invalid settings", () => {
    expect(() => factory.create("invalid" as any)).toThrow(
      "Invalid quiz service settings",
    );
  });
});
