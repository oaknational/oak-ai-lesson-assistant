import { useCallback } from "react";
import Textarea from "react-textarea-autosize";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { useModerationFeedbackSurvey } from "hooks/surveys/useModerationFeedbackSurvey";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { Icon } from "@/components/Icon";

import ChatButton from "./ui/chat-button";

const ToxicModerationView = ({
  chatId,
  moderation,
}: {
  chatId: string;
  moderation: PersistedModerationBase;
}) => {
  const { onSubmit, comment, setComment, hasSubmitted, isValid } =
    useModerationFeedbackSurvey({
      chatId,
      moderation,
    });
  const router = useRouter();
  const handleNewLesson = useCallback(() => {
    router.push("/aila");
  }, [router]);

  const handleOnSubmit = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  const handleOnChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setComment(e.target.value);
    },
    [setComment],
  );
  return (
    <div className="fixed inset-0 z-50 flex w-full items-center justify-center bg-lavender30 ">
      <div className="m-18  max-w-[600px] flex-col gap-13 border-2 border-gray-900 bg-white p-18">
        <div className="flex justify-between">
          <Icon icon="warning" size="md" />
          <Button
            icon="cross"
            variant="icon-only"
            title="New lesson"
            onClick={handleNewLesson}
          />
        </div>
        <div className="flex w-full flex-col gap-11 text-base">
          <div>
            <h2 className="mb-6 mt-12 text-lg font-bold">
              Inappropriate content detected
            </h2>
            <p>
              Your lesson can no longer be worked on. Your account will be
              blocked if you persist in creating inappropriate content. If this
              is an error, please give us feedback below.
            </p>
          </div>
          {hasSubmitted ? (
            <p>
              Thank you for your feedback. We will review your lesson and adjust
              our process if necessary.
            </p>
          ) : (
            <form onSubmit={handleOnSubmit}>
              <Textarea
                className="min-h-30 w-full resize-none rounded border border-gray-600 bg-transparent px-10 py-[0.6rem] text-base placeholder-gray-700 focus-within:outline-none"
                onChange={handleOnChange}
                value={comment}
                placeholder="Your feedback"
              />
            </form>
          )}
          <div className="flex w-full justify-between gap-7">
            <ChatButton
              variant={hasSubmitted ? "primary" : "text-link"}
              onClick={handleNewLesson}
            >
              New lesson
            </ChatButton>
            {!hasSubmitted && (
              <ChatButton
                variant="primary"
                onClick={handleOnSubmit}
                disabled={!isValid}
              >
                Submit feedback
              </ChatButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToxicModerationView;
