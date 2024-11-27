import { QuizQuestion, Quiz, QuizSchema } from "../../../protocol/schema";
import { CircleTheoremLesson } from "../fixtures/CircleTheoremsExampleOutput";
import { MLQuizGenerator } from "./MLQuizGenerator";

describe("MLQuizGenerator", () => {
  let mlQuizGenerator: MLQuizGenerator;

  beforeEach(() => {
    mlQuizGenerator = new MLQuizGenerator();
  });

  it("should generate a starter quiz", async () => {
    const result =
      await mlQuizGenerator.generateMathsStarterQuizPatch(CircleTheoremLesson);
    console.log("starter quiz result", JSON.stringify(result));
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);

    result.forEach((item) => {
      expect(QuizSchema.safeParse(item).success).toBe(true);
    });
  });

  it("should generate an exit quiz", async () => {
    const result =
      await mlQuizGenerator.generateMathsExitQuizPatch(CircleTheoremLesson);
    console.log("exit quiz result", JSON.stringify(result));
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((item) => {
      expect(QuizSchema.safeParse(item).success).toBe(true);
    });
  });
});
