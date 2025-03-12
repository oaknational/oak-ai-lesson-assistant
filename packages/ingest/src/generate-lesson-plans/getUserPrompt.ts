import { isTruthy } from "remeda";

import { IngestError } from "../IngestError";
import type { Captions, RawLesson } from "../zod-schema/zodSchema";
import { exitQuizPromptPart } from "./user-prompt-parts/exitQuiz.promptPart";
import { keyLearningPointsPromptPart } from "./user-prompt-parts/keyLearningPoints.promptPart";
import { lessonKeywordsPromptPart } from "./user-prompt-parts/keywords.promptPart";
import { learningOutcomePromptPart } from "./user-prompt-parts/learningOutcome.promptPart";
import { misconceptionsPromptPart } from "./user-prompt-parts/misconceptions.promptPart";
import { starterQuizPromptPart } from "./user-prompt-parts/starterQuiz.promptPart";
import { titleSubjectKeyStagePromptPart } from "./user-prompt-parts/titleSubjectKeyStage.promptPart";
import { transcriptPromptPart } from "./user-prompt-parts/transcript.promptPart";
import { yearPromptPart } from "./user-prompt-parts/year.promptPart";

export type SourcePartsToInclude = "all" | "title-subject-key-stage";
export function getUserPrompt({
  rawLesson,
  captions,
  sourcePartsToInclude = "all",
}: {
  rawLesson: RawLesson;
  captions?: Captions;
  sourcePartsToInclude?: SourcePartsToInclude;
}): string {
  switch (sourcePartsToInclude) {
    case "title-subject-key-stage":
      return titleSubjectKeyStagePromptPart(rawLesson);

    case "all":
      if (!captions) {
        throw new IngestError(
          "Captions are required for sourcePartsToInclude 'all'",
        );
      }
      return [
        titleSubjectKeyStagePromptPart(rawLesson),
        yearPromptPart(rawLesson),
        transcriptPromptPart(captions),
        learningOutcomePromptPart(rawLesson),
        keyLearningPointsPromptPart(rawLesson),
        misconceptionsPromptPart(rawLesson),
        lessonKeywordsPromptPart(rawLesson),
        starterQuizPromptPart(rawLesson),
        exitQuizPromptPart(rawLesson),
      ]
        .filter(isTruthy)
        .join("\n\n\n");
  }
}
