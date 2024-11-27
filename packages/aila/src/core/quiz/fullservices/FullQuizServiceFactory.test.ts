import { SimpleFullQuizService } from "./BaseFullQuizService";
import { DemoFullQuizService } from "./DemoFullQuizService";
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

  it('should create DemoFullQuizService when settings is "demo"', () => {
    const service = factory.create("demo");
    expect(service).toBeInstanceOf(DemoFullQuizService);
  });

  it("should throw error for invalid settings", () => {
    expect(() => factory.create("invalid" as any)).toThrow(
      "Invalid quiz service settings",
    );
  });
});
