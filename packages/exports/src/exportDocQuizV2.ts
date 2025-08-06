import type { QuizDocInputData } from "./schema/input.schema";
import { prepQuizForDocsV2 } from "./dataHelpers/prepQuizForDocsV2";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDocV2 } from "./gSuite/docs/populateDocV2";
import { getDocsTemplateIdQuiz } from "./templates";
import type { OutputData, Result, State } from "./types";

const QUIZ_TYPE_LABELS = {
  starter: "Starter quiz",
  exit: "Exit quiz",
};

/**
 * V2 Quiz export that supports all question types (multiple-choice, order, match, short-answer)
 * This is behind a feature flag and will eventually replace exportDocQuiz
 */
export const exportDocQuizV2 = async ({
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  data: QuizDocInputData;
  userEmail: string;
  onStateChange: (state: State<OutputData>) => void;
}): Promise<Result<OutputData>> => {
  try {
    const { quizType, quiz, lessonTitle } = inputData;

    const result = await exportGeneric({
      newFileName: `${lessonTitle} - ${snapshotId} - ${QUIZ_TYPE_LABELS[quizType]}`,
      data: {
        title: lessonTitle,
        quiz,
        quizType,
      },
      prepData: prepQuizForDocsV2,
      templateId: getDocsTemplateIdQuiz(),
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateDocV2({
          googleDocs: client,
          documentId: templateCopyId,
          data,
        });
      },
      userEmail,
      onStateChange,
    });
    if ("error" in result) {
      onStateChange({ status: "error", error: result.error });
      return result;
    }

    onStateChange({ status: "success", data: result.data });
    return result;
  } catch (error) {
    const errorResult = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
    onStateChange({ status: "error", error: errorResult.error });
    return errorResult;
  }
};