import { ExportDocQuizData } from "..";
import { prepQuizForDocs } from "./dataHelpers/prepQuizForDocs";
import { exportGeneric } from "./exportGeneric";
import { getDocsClient } from "./gSuite/docs/client";
import { populateDoc } from "./gSuite/docs/populateDoc";
import { getDocsTemplateIdQuiz } from "./templates";
import { OutputData, Result, State } from "./types";

const QUIZ_TYPE_LABELS = {
  starter: "Starter quiz",
  exit: "Exit quiz",
};
// build
export const exportDocQuiz = async ({
  snapshotId,
  data: inputData,
  userEmail,
  onStateChange,
}: {
  snapshotId: string;
  data: ExportDocQuizData;
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
      prepData: prepQuizForDocs,
      templateId: getDocsTemplateIdQuiz(),
      populateTemplate: async ({ data, templateCopyId }) => {
        const client = await getDocsClient();
        return populateDoc({
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

    const { data } = result;

    onStateChange({ status: "success", data });
    return { data };
  } catch (error) {
    onStateChange({ status: "error", error });
    return { error, message: "Failed to export Quiz doc" };
  }
};
