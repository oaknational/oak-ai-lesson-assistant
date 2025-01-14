import type { Dispatch } from "react";
import { useState } from "react";

import { Flex, Heading } from "@radix-ui/themes";

import type { QuizAppAction } from "@/ai-apps/quiz-designer/state/actions";
import { QuizAppActions } from "@/ai-apps/quiz-designer/state/actions";
import useAnalytics from "@/lib/analytics/useAnalytics";

import ChatButton from "../../Chat/ui/chat-button";
import ShareButtonGroup from "../../common/ShareButtonGroup";

type ControllerProps = {
  hasQuestions: boolean;
  canExport: boolean;
  dispatch: Dispatch<QuizAppAction>;
  toggleExportMenu: () => void;
  shareContent: () => void;
  shareId: string | null;
  shareLoading: boolean;
};

const ControllerRow = ({
  hasQuestions,
  canExport,
  dispatch,
  toggleExportMenu,
  shareContent,
  shareId,
  shareLoading,
}: Readonly<ControllerProps>) => {
  const [restartWarning, setRestartWarning] = useState(false);
  const { trackEvent } = useAnalytics();

  if (!hasQuestions && !canExport) return null;

  return (
    <Flex
      className="relative z-10 py-24 before:absolute before:left-[-50vw] before:top-0 before:-z-10 before:h-full before:w-[150vw] before:bg-oakGrey1"
      direction="column"
    >
      <Flex
        direction={{ initial: "column", sm: "row" }}
        align="center"
        justify="between"
        gap="5"
      >
        <Flex
          direction="column"
          align={{ initial: "center", sm: "start" }}
          gap="4"
        >
          <Heading size="4" as="h5">
            Continue...
          </Heading>
          {hasQuestions && (
            <ChatButton
              variant="primary"
              onClick={() => {
                trackEvent("quiz_designer:add_question");
                dispatch({ type: QuizAppActions.AddQuestion });
              }}
              icon="mini-menu"
            >
              Add question
            </ChatButton>
          )}
        </Flex>
        <Flex
          direction="column"
          align={{ initial: "center", sm: "start" }}
          gap="4"
          className="mt-14 sm:mt-0"
        >
          <Heading size="4" as="h5">
            {hasQuestions ? "Finish" : "Add questions to export your quiz"}
          </Heading>
          {canExport && (
            <Flex
              direction={{
                initial: "column",
                sm: "row",
              }}
              align={{ initial: "center", sm: "start" }}
              gap="6"
            >
              <ShareButtonGroup
                loading={shareLoading}
                shareContent={shareContent}
                shareId={shareId}
                app="quiz-designer"
              />
              <ChatButton
                variant="primary"
                icon="download"
                disabled={!canExport}
                onClick={() => {
                  toggleExportMenu();
                }}
              >
                Export
              </ChatButton>
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        direction="row"
        justify="end"
        mt="7"
        pt="5"
        className="border-t border-black border-opacity-25"
      >
        <Flex direction="column" gap="6" align="end">
          <ChatButton
            variant="text-link"
            icon="reload"
            onClick={() => {
              trackEvent("quiz_designer:restart");
              setRestartWarning(true);
            }}
          >
            Create new quiz
          </ChatButton>
          {restartWarning && (
            <Flex direction="column">
              <p className="max-w-[300px]">
                This will delete your current quiz and start a new one. Are you
                sure you want to continue
              </p>
              <Flex gap="6" mt="4">
                <ChatButton
                  variant="text-link"
                  onClick={() => {
                    dispatch({ type: QuizAppActions.RequestReset });
                  }}
                >
                  Yes
                </ChatButton>
                <ChatButton
                  variant="text-link"
                  onClick={() => {
                    setRestartWarning(false);
                  }}
                >
                  No
                </ChatButton>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ControllerRow;
