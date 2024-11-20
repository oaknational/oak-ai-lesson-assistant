import type {
  LooseLessonPlan,
  Quiz,
  QuizQuestion,
} from "../../protocol/schema";
import type { AilaQuizGeneratorService } from "../AilaServices";
import type { BaseSchema, BaseType } from "./ChoiceModels";
import { MLQuizGenerator } from "./MLQuizGenerator";
import { TestSchemaReranker } from "./SchemaReranker";
import { SimpleQuizSelector } from "./SimpleQuizSelector";
import type {
  AilaQuizReranker,
  FullQuizService,
  QuizSelector,
} from "./interfaces";
import type { quizPatchType } from "./interfaces";

export abstract class BaseFullQuizService implements FullQuizService {
  public abstract quizSelector: QuizSelector<BaseType>;
  public abstract quizReranker: AilaQuizReranker<typeof BaseSchema>;
  public abstract quizGenerators: AilaQuizGeneratorService[];

  public async createBestQuiz(
    quizType: quizPatchType,
    lessonPlan: LooseLessonPlan,
  ): Promise<QuizQuestion[]> {
    const quizzes: Quiz[] = [];
    for (const quizGenerator of this.quizGenerators) {
      if (quizType === "/starterQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsStarterQuizPatch(lessonPlan)),
        );
      } else if (quizType === "/exitQuiz") {
        quizzes.push(
          ...(await quizGenerator.generateMathsExitQuizPatch(lessonPlan)),
        );
      }
    }
    // TODO: GCLOMAX - make the typing stricter here.
    // TODO: GCLOMAX - make sure that the rating schema is the same for all rerankers.
    if (!this.quizReranker.ratingSchema) {
      throw new Error("Reranker rating schema is undefined");
    }

    const quizRankings = await this.quizReranker.evaluateQuizArray(
      quizzes,
      lessonPlan,
      this.quizReranker.ratingSchema,
      quizType,
    );

    const parsedRankings = quizRankings.map((ranking) => ranking.parse({}));
    const bestQuiz = this.quizSelector.selectBestQuiz(quizzes, parsedRankings);
    return bestQuiz;
  }
}

export class SimpleFullQuizService extends BaseFullQuizService {
  public quizSelector: QuizSelector<BaseType> =
    new SimpleQuizSelector<BaseType>();

  public quizReranker: AilaQuizReranker<typeof BaseSchema> =
    new TestSchemaReranker();
  public quizGenerators: AilaQuizGeneratorService[] = [new MLQuizGenerator()];
}
