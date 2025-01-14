import { useState } from "react";

import { aiLogger } from "@oakai/logger";
import { z } from "zod";

import { optionSchema } from "@/ai-apps/comparative-judgement/state/types";
import { trpc } from "@/utils/trpc";

const log = aiLogger("judgements");

type FlaggedOrSkipped = "FLAGGED" | "SKIPPED";

type FlagOrSkipQuestion = {
  judgementId: string | null;
  flaggedOrSkipped: FlaggedOrSkipped;
};

type UseQuestionsForJudgementProps = {
  keyStage?: string;
  subject?: string;
};

const lessonDescriptionSchema = z
  .object({
    lessonDescription: z.string(),
  })
  .passthrough();
const pupilLessonOutcomeSchema = z
  .object({
    pupilLessonOutcome: z.string(),
  })
  .passthrough();

const useQuestionsForJudgement = ({
  keyStage,
  subject,
}: Readonly<UseQuestionsForJudgementProps>) => {
  const questionsFromTrpc =
    trpc.judgement.getComparisonBySubjectKeyStagePair.useQuery({
      keyStage: keyStage ?? "",
      subject: subject ?? "",
    });
  const flagOrSkipQuestion = trpc.judgement.flagOrSkipQuestion.useMutation();
  const selectedQuestion = trpc.judgement.selectBetterQuestionSet.useMutation();

  const data = questionsFromTrpc.data;
  //*********************************************** *//

  let content;

  let lessonDescription = "";
  if (data?.questionForJudgement?.quizQuestion?.lesson?.content) {
    content = data?.questionForJudgement?.quizQuestion?.lesson?.content ?? "";
    const parsedLessonContent = lessonDescriptionSchema?.parse(content);

    lessonDescription = parsedLessonContent?.lessonDescription;
  } else if (
    data?.questionForJudgement?.quizQuestion?.lesson?.newLessonContent
  ) {
    content =
      data?.questionForJudgement?.quizQuestion?.lesson?.newLessonContent ?? "";
    const parsedLessonContent = pupilLessonOutcomeSchema?.parse(content);
    lessonDescription =
      "Pupil outcome: " + parsedLessonContent?.pupilLessonOutcome;
  }

  //*********************************************** *//
  const questionText = data?.questionForJudgement?.quizQuestion?.question;
  const optionA = optionSchema.parse(data?.optionA);
  const optionB = optionSchema.parse(data?.optionB);
  const id: string | undefined = data?.id;
  const flagQuestion = async () => {
    const flaggedInfo: FlagOrSkipQuestion = {
      judgementId: data?.id ?? null,
      flaggedOrSkipped: "FLAGGED",
    };
    const result = await flagOrSkipQuestion.mutateAsync(flaggedInfo);
    if (result) {
      log.info("Flagged question");
      await clearReasonForChoice();
    } else {
      log.info("Failure flag did not work");
    }
  };

  const skipQuestion = async () => {
    const skippedInfo: FlagOrSkipQuestion = {
      judgementId: data?.id ?? "",
      flaggedOrSkipped: "SKIPPED",
    };

    const result = await flagOrSkipQuestion.mutateAsync(skippedInfo);
    if (result) {
      log.info("Skipped question", result);
      await clearReasonForChoice();
    } else {
      log.info("Failure skip did not work");
    }
  };

  const [reasonForChoice, setReasonForChoice] = useState<string>("");
  const [winnerId, setWinnerId] = useState<string>("");

  const clearReasonForChoice = async () => {
    setWinnerId("");
    setReasonForChoice("");
    await questionsFromTrpc.refetch();
  };

  const chooseQuestion = async () => {
    const selectedQuestionInfo = {
      judgementId: data?.id ?? "",
      winnerId,
      reason: reasonForChoice ?? "",
    };
    const result = await selectedQuestion.mutateAsync(selectedQuestionInfo);

    if (result) {
      log.info("success");
      await clearReasonForChoice();
    } else {
      log.info("failure");
    }
  };

  const isLoading =
    selectedQuestion.isLoading ||
    questionsFromTrpc.isRefetching ||
    questionsFromTrpc.isLoading ||
    flagOrSkipQuestion.isLoading;

  return {
    data,
    questionText,
    optionA,
    optionB,
    flagQuestion,
    skipQuestion,
    chooseQuestion,
    reasonForChoice,
    setReasonForChoice,
    winnerId,
    setWinnerId,
    isLoading,
    id,
    lessonDescription,
  };
};

export default useQuestionsForJudgement;
