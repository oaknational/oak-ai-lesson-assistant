/**
 * Quiz Generation Pipeline Factory
 *
 * Builds a quiz service that coordinates a three-stage pipeline:
 *
 * 1. **Sources** (1 or more): Retrieve candidate quiz questions from various origins
 *    - `similarLessons`: Questions from lessons matching title/subject/key stage
 *    - `basedOnLesson`: Questions from user-specified "based on" lesson (high signal)
 *    - `multiQuerySemantic`: Multiple semantic searches with Cohere reranking
 *
 * 2. **Enrichers** (0 or more): Process pools to add metadata
 *    - `imageDescriptions`: Generate text descriptions of images for LLM context
 *
 * 3. **Composer** (1): Selects final questions from enriched pools
 *    - `llm`: Uses AI to select best questions across all pools
 *
 * Pipeline flow: Sources → Enrichers → Composer → Final Quiz
 */
import { aiLogger } from "@oakai/logger";

import type {
  AilaRagRelevantLesson,
  PartialLessonPlan,
  QuizPath,
} from "../../../protocol/schema";
import { buildQuizFromQuestions } from "../buildQuizObject";
import { LLMComposer } from "../composers/LLMQuizComposer";
import { ImageDescriptionEnricher } from "../enrichers/ImageDescriptionEnricher";
import type {
  QuestionEnricher,
  QuestionSource,
  QuizComposer,
  QuizService,
} from "../interfaces";
import { BasedOnLessonSource } from "../question-sources/BasedOnLessonSource";
import { CurrentQuizSource } from "../question-sources/CurrentQuizSource";
import { MultiQuerySemanticSource } from "../question-sources/MultiQuerySemanticSource";
import { SimilarLessonsSource } from "../question-sources/SimilarLessonsSource";
import type { Task } from "../reporting";
import type {
  QuestionEnricherType,
  QuestionSourceType,
  QuizBuilderSettings,
  QuizComposerType,
} from "../schema";

const log = aiLogger("quiz");

function createSource(type: QuestionSourceType): QuestionSource {
  switch (type) {
    case "similarLessons":
      return new SimilarLessonsSource();
    case "basedOnLesson":
      return new BasedOnLessonSource();
    case "multiQuerySemantic":
      return new MultiQuerySemanticSource();
    case "currentQuiz":
      return new CurrentQuizSource();
  }
}

function createEnricher(type: QuestionEnricherType): QuestionEnricher {
  switch (type) {
    case "imageDescriptions":
      return new ImageDescriptionEnricher();
  }
}

function createComposer(type: QuizComposerType): QuizComposer {
  switch (type) {
    case "llm":
      return new LLMComposer();
  }
}

async function buildQuiz(
  sources: QuestionSource[],
  enrichers: QuestionEnricher[],
  composer: QuizComposer,
  quizType: QuizPath,
  lessonPlan: PartialLessonPlan,
  similarLessons: AilaRagRelevantLesson[],
  task: Task,
  reportId: string,
  userInstructions?: string | null,
) {
  task.addData({
    inputs: {
      quizType,
      lessonPlan,
      similarLessons,
      userInstructions,
    },
  });

  // Run all sources in parallel
  const poolPromises = sources.map((source) =>
    task.child(source.name, async (t) => {
      const pools =
        quizType === "/starterQuiz"
          ? await source.getStarterQuizCandidates(lessonPlan, similarLessons, t)
          : await source.getExitQuizCandidates(lessonPlan, similarLessons, t);

      t.addData({
        pools,
        poolCount: pools.length,
        questionCount: pools.reduce((sum, p) => sum + p.questions.length, 0),
      });
      return pools;
    }),
  );

  const poolArrays = await Promise.all(poolPromises);
  let questionPools = poolArrays.flat();

  // Run enrichers sequentially (each transforms the pools)
  for (const enricher of enrichers) {
    questionPools = await task.child(enricher.name, (t) =>
      enricher.enrich(questionPools, t),
    );
  }

  // Compose final questions from enriched pools
  const composerResult = await task.child(composer.name, async (t) => {
    const result = await composer.compose(
      questionPools,
      lessonPlan,
      quizType,
      t,
      userInstructions,
    );
    t.addData({
      status: result.status,
      selectedCount: result.questions.length,
      ...(result.status === "bail" && { bailReason: result.bailReason }),
    });
    return result;
  });

  return buildQuizFromQuestions(
    composerResult.questions,
    reportId,
    composerResult.status === "bail" ? composerResult.bailReason : undefined,
  );
}

export function buildQuizService(settings: QuizBuilderSettings): QuizService {
  const sources = settings.sources.map(createSource);
  const enrichers = settings.enrichers.map(createEnricher);
  const composer = createComposer(settings.composer);

  log.info("Building quiz service with settings:", {
    sources: settings.sources,
    enrichers: settings.enrichers,
    composer: settings.composer,
  });

  return {
    sources,
    enrichers,
    composer,
    buildQuiz: (
      quizType,
      lessonPlan,
      similarLessons,
      task,
      reportId,
      userInstructions,
    ) =>
      buildQuiz(
        sources,
        enrichers,
        composer,
        quizType,
        lessonPlan,
        similarLessons,
        task,
        reportId,
        userInstructions,
      ),
  };
}
