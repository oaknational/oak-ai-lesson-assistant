import { useCallback } from "react";
import { toast } from "react-hot-toast";
import Textarea from "react-textarea-autosize";

import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useModerationFeedbackSurvey } from "@/hooks/surveys/useModerationFeedbackSurvey";
import { useModerationStore } from "@/stores/AilaStoresProvider";

import ChatButton from "./ui/chat-button";

export type ToxicModerationViewProps = Readonly<{
  chatId: string;
  moderation: PersistedModerationBase;
}>;
const ToxicModerationView = ({
  chatId,
  moderation,
}: ToxicModerationViewProps) => {
  const { onSubmit, comment, setComment, hasSubmitted, isValid } =
    useModerationFeedbackSurvey({
      chatId,
      moderation,
    });
  const handleSubmit = useCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      onSubmit(e).catch((error) => {
        toast.error("Failed to submit feedback");
        Sentry.captureException(error, { extra: { chatId } });
      });
    },
    [onSubmit, chatId],
  );
  const clearModerations = useModerationStore(
    (state) => state.clearModerations,
  );
  const router = useRouter();
  return (
    <div className="fixed inset-0 z-50 flex w-full items-center justify-center bg-lavender30">
      <div className="m-18 max-w-[600px] flex-col gap-13 border-2 border-gray-900 bg-white p-18">
        <div className="flex justify-between">
          <Icon icon="warning" size="md" />
          <Button
            icon="cross"
            variant="icon-only"
            title="New lesson"
            onClick={() => {
              clearModerations();
              router.push("/aila");
            }}
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
            <form onSubmit={handleSubmit}>
              <Textarea
                className="min-h-30 w-full resize-none rounded border border-gray-600 bg-transparent px-10 py-[0.6rem] text-base placeholder-gray-700 focus-within:outline-none"
                onChange={(e) => setComment(e.target.value)}
                value={comment}
                placeholder="Your feedback"
              />
            </form>
          )}
          <div className="flex w-full justify-between gap-7">
            <ChatButton
              variant={hasSubmitted ? "primary" : "text-link"}
              onClick={() => {
                router.push("/aila");
              }}
            >
              New lesson
            </ChatButton>
            {!hasSubmitted && (
              <ChatButton
                variant="primary"
                onClick={handleSubmit}
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
