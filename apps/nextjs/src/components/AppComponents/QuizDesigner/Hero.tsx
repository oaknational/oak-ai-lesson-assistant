import type { Dispatch} from "react";
import { useCallback } from "react";

import type { KeyStageName, SubjectName } from "@oakai/core";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import type {
  QuizAppAction} from "ai-apps/quiz-designer/state/actions";
import {
  QuizAppActions,
} from "ai-apps/quiz-designer/state/actions";
import type { QuizAppState} from "ai-apps/quiz-designer/state/types";
import { QuizAppStatus } from "ai-apps/quiz-designer/state/types";
import Image from "next/image";

import jigsaw from "@/assets/svg/illustration/jigsaw.svg";
import ErrorBox from "@/components/AppComponents/QuizDesigner/ErrorBox";
import SubjectKeyStageSection from "@/components/AppComponents/QuizDesigner/SubjectKeyStageSection";
import Button from "@/components/Button";
import HeroContainer from "@/components/HeroContainer";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatButton from "../Chat/ui/chat-button";

type HeroProps = {
  state: QuizAppState;
  dispatch: Dispatch<QuizAppAction>;
  questionsWrapperRef: React.RefObject<HTMLDivElement>;
};

const Hero = ({
  state,
  dispatch,
  questionsWrapperRef,
}: Readonly<HeroProps>) => {
  const { trackEvent } = useAnalytics();

  const setTopic = useCallback(
    (topic: string) => {
      dispatch({ type: QuizAppActions.SetTopic, topic });
    },
    [dispatch],
  );

  const setKeyStage = useCallback(
    (keyStage: KeyStageName) => {
      dispatch({ type: QuizAppActions.SetKeyStage, keyStage });
    },
    [dispatch],
  );

  const setSubject = useCallback(
    (subject: SubjectName) => {
      dispatch({ type: QuizAppActions.SetSubject, subject });
    },
    [dispatch],
  );

  const hasQuestions = state.questions.length > 0;
  const hasStartedQuiz = state.status === QuizAppStatus.EditingQuestions;
  const isMissingSessionId =
    state.status !== QuizAppStatus.Initial && !state.sessionId;
  const hasError =
    state.status == QuizAppStatus.NonRecoverableError || isMissingSessionId;

  const canBegin =
    state.status === QuizAppStatus.EditingSubjectAndKS &&
    Boolean(state.keyStage) &&
    Boolean(state.subject) &&
    !hasError;

  return (
    <HeroContainer>
      <Flex
        direction={{ initial: "column-reverse", sm: "row" }}
        justify="between"
        align="center"
      >
        <div className="max-w-[520px]">
          <Box mb="5">
            <Heading
              size="8"
              className="text-lg"
              mb="3"
              as="h1"
              data-testid="quiz-designer-h1"
            >
              Quiz designer
            </Heading>
            <Text size="4" className="font-regular">
              Use your own questions to generate answers and distractors, see
              suggested additional questions and lessons, then export the quiz
              into a format of your choice.
            </Text>
            <Box mt="3">
              <Button variant="text-link" href="/prompts">
                How does this work?
              </Button>
            </Box>

            {hasError && (
              <ErrorBox
                message={
                  <>
                    There seems to have been an error setting up this quiz.
                    <br />
                    Please reload the page to try again
                  </>
                }
              />
            )}
          </Box>

          <SubjectKeyStageSection
            keyStage={state.keyStage as KeyStageName}
            setKeyStage={setKeyStage}
            subject={state.subject as SubjectName}
            setSubject={setSubject}
            topic={state.topic}
            setTopic={setTopic}
            hasStartedApp={hasStartedQuiz}
          />
          {!hasStartedQuiz && (
            <ChatButton
              variant="text-link"
              icon="arrow-right"
              disabled={!canBegin}
              onClick={async () => {
                if (canBegin) {
                  if (hasQuestions) {
                    dispatch({ type: QuizAppActions.BackToEditQuestions });
                  } else {
                    trackEvent("quiz_designer:begin");
                    dispatch({ type: QuizAppActions.Begin });
                  }
                  const questionsWrapper = questionsWrapperRef.current;
                  if (questionsWrapper) {
                    const { top } = questionsWrapper.getBoundingClientRect();
                    window.scrollTo({
                      top: top + window.pageYOffset - 200,
                      behavior: "smooth",
                    });
                  }
                }
              }}
            >
              Start
            </ChatButton>
          )}
          <Flex gap="6" direction="row" mt="3">
            {hasStartedQuiz && (
              <ChatButton
                variant="primary"
                onClick={() => {
                  dispatch({ type: QuizAppActions.BackToEditSubjectAndKS });
                }}
              >
                Edit
              </ChatButton>
            )}
            {state.status !== QuizAppStatus.Initial &&
              state.status !== QuizAppStatus.EditingSubjectAndKS &&
              state.questions.length > 1 && (
                <ChatButton
                  variant="primary"
                  onClick={() => {
                    dispatch({ type: QuizAppActions.RequestReset });
                  }}
                >
                  Create new quiz
                </ChatButton>
              )}
          </Flex>
        </div>
        <Box className="hidden sm:flex">
          <Image
            src={jigsaw}
            alt="Magic Carpet"
            width={400}
            height={400}
            priority={true}
          />
        </Box>
      </Flex>
    </HeroContainer>
  );
};

export default Hero;
