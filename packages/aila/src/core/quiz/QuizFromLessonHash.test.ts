// @ts-nocheck
import { AilaQuiz } from "./AilaQuiz";

describe("Test get lesson id from plan id", () => {
  it("should return the correct lesson slug", async () => {
    // @ts-ignore
    const quiz = new AilaQuiz();
    const planIDHash = "aLaUYjYaq6HGN_ttldQUl";
    const lessonSlug = await quiz.getLessonIdFromPlanId(planIDHash);
    console.log("Lesson Slug", lessonSlug);
    expect(lessonSlug).toBe("clna7q33t2enqp4qxcavx64j8");
  });
});
