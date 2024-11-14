import {
  JsonPatchDocumentJsonSchema,
  JsonPatchDocumentSchema,
} from "../../protocol/jsonPatchProtocol";
import { QuizSchema } from "../../protocol/schema";
import { AilaQuiz } from "./AilaQuiz";

describe("Tests hashes to slugs - planIDHashToLessonID for retrieval", () => {
  it("should return the correct lesson slug", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "aLaUYjYaq6HGN_ttldQUl";
    const lessonSlug = await quiz.getLessonIdFromPlanId(planIDHash);
    expect(lessonSlug).toBe("clna7q33t2enqp4qxcavx64j8");
  });

  it("Should return the correct lesson slug for a given plan ID. Note that if the underlying database changes this test will fail - requires you to look up and verify in the database to set this test up", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "03ZjmmtC_6sFPIlmqFJEN";
    const lessonSlug = await quiz.getLessonSlugFromPlanId(planIDHash);
    expect(lessonSlug).toBe(
      "circle-theorems-a-tangent-and-radius-are-perpendicular-at-the-point-of-contact-cgwkac",
    );
  });

  it("Should throw an error if given a nonsense plan ID", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "nonsense";
    await expect(quiz.getLessonSlugFromPlanId(planIDHash)).rejects.toThrow();
  });
});

// "03ZjmmtC_6sFPIlmqFJEN"

describe("Tests retrieving a list of custom question Uids", () => {
  it("should return a list of custom question Uids", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "aLaUYjYaq6HGN_ttldQUl";

    const lessonSlugs = await quiz.getLessonSlugFromPlanId(planIDHash);
    const lessonSlugList = lessonSlugs ? [lessonSlugs] : [];

    const customQuestionUids =
      await quiz.lessonSlugToQuestionIdSearch(lessonSlugList);

    console.log("Custom Question UIDs", JSON.stringify(customQuestionUids));
    expect(customQuestionUids).toBeDefined();
    expect(customQuestionUids.length).toBeGreaterThan(0);
  });
});

describe("Tests generating a maths quiz patch from a given PlanID", () => {
  it("should return a quiz object", async () => {
    const quiz = new AilaQuiz();
    const planIDHash = "aLaUYjYaq6HGN_ttldQUl";
    const quizObject = await quiz.generateMathsQuizFromRagPlanId(planIDHash);
    expect(quizObject).toBeDefined();
    const result = JsonPatchDocumentSchema.safeParse(quizObject);
    console.log("JSON Patch Document", JSON.stringify(quizObject, null, 2));
    expect(result.success).toBe(true);
  });
});

describe("Tests generating a list of quizQuestion objects from a list of custom IDs", () => {
  it("should return a list of quiz objects", async () => {
    const quiz = new AilaQuiz();
    const customQuestionUids = ["QUES-YSEJ1-99667", "QUES-WFEB1-99668"];
    const quizQuestions =
      await quiz.questionArrayFromCustomIds(customQuestionUids);
    console.log("Quiz Questions", JSON.stringify(quizQuestions, null, 2));
    const resultArray = QuizSchema.safeParse(quizQuestions);
    expect(quizQuestions).toBeDefined();
    expect(quizQuestions.length).toBeGreaterThan(0);
    expect(resultArray.success).toBe(true);
  });
});
