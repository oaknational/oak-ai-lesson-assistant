import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateQuizDoc } from "./gSuite/docs/populate/populateQuizDoc";
import type { QuizDocInputData } from "./schema/input.schema";
import { getDocsTemplateIdQuiz } from "./templates";
import type { OutputData, Result, State } from "./types";

const QUIZ_TYPE_LABELS = {
  starter: "Starter quiz",
  exit: "Exit quiz",
};

/**
 * Export quiz documents with support for all question types
 */
export const exportDocQuiz = async ({
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
    const { quizType, lessonTitle } = inputData;

    const result = await exportGeneric({
      newFileName: `${lessonTitle} - ${snapshotId} - ${QUIZ_TYPE_LABELS[quizType]}`,
      data: inputData,
      prepData: (data) =>
        Promise.resolve({
          lesson_title: data.lessonTitle,
          quiz_type: QUIZ_TYPE_LABELS[data.quizType],
          questions: data.quiz.questions,
          imageAttributions: data.quiz.imageAttributions,
        }),
      templateId: getDocsTemplateIdQuiz(),
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateQuizDoc({
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
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorResult: Result<OutputData> = {
      error: errorObj,
      message: errorMessage,
    };
    onStateChange({ status: "error", error: errorMessage });
    return errorResult;
  }
};
