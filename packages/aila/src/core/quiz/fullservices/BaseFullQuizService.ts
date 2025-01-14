import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  LooseLessonPlan,
  Quiz,
  QuizQuestion,
} from "../../../protocol/schema";
import type { AilaQuizGeneratorService } from "../../AilaServices";
import type { BaseSchema, BaseType } from "../ChoiceModels";
// import { MLQuizGenerator } from "../generators/MLQuizGenerator";
import type {
  AilaQuizReranker,
  FullQuizService,
  quizPatchType,
  QuizSelector,
} from "../interfaces";
import { testRatingSchema } from "../rerankers/RerankerStructuredOutputSchema";
// import { TestSchemaReranker } from "../rerankers/SchemaReranker";
import { SimpleQuizSelector } from "../selectors/SimpleQuizSelector";

const log = aiLogger("aila:quiz");

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker<typeof BaseSchema>;
  public abstract quizGenerators: AilaQuizGeneratorService[];
  // TODO: MG - does having ailaRagRelevantLessons as a default parameter work? It feels a bit hacky.
  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
    ailaRagRelevantLessons: AilaRagRelevantLesson[] = [],
  ): Promise<QuizQuestion[]> {
    const quizzes: Quiz[] = [];
    for (const quizGenerator of this.quizGenerators) {
      if (quizType === "/starterQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsStarterQuizPatch(
            lessonPlan,
            ailaRagRelevantLessons,
          )),
        );
      } else if (quizType === "/exitQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsExitQuizPatch(
            lessonPlan,
            ailaRagRelevantLessons,
          )),
        );
      }
    }
    // TODO: GCLOMAX - make the typing stricter here.
    // TODO: GCLOMAX - make sure that the rating schema is the same for all rerankers.
    if (!this.quizReranker.ratingSchema) {
      throw new Error("Reranker rating schema is undefined");
    }
    // TODO: GCLOMAX - This is changed to be hashed.
    const quizRankings = await this.quizReranker.evaluateQuizArray(
      quizzes,
      lessonPlan,
      this.quizReranker.ratingSchema,
      quizType,
    );
    // TODO: GCLOMAX - this is hacky, but the typescript compiler gets annoyed with the zod and inference stuff.
    if (!quizRankings[0]) {
      // throw new Error("Quiz rankings are undefined");
      return [];
    }
    const parsedRankings = quizRankings.map((ranking) =>
      this.quizReranker.ratingSchema!.parse(ranking),
    );

    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, parsedRankings);
    return bestQuiz;
  }
}

// export class SimpleFullQuizService extends BaseFullQuizService {
//   public quizSelector: QuizSelector<BaseType> =
//     new SimpleQuizSelector<BaseType>();

//   public quizReranker: AilaQuizReranker<typeof BaseSchema> =
//     new TestSchemaReranker(testRatingSchema, "/starterQuiz");
//   public quizGenerators: AilaQuizGeneratorService[] = [new MLQuizGenerator()];
// }
