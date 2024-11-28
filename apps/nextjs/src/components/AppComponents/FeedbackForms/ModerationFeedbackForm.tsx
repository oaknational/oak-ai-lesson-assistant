import { useEffect } from "react";

import { moderationSlugToDescription } from "@oakai/core/src/utils/ailaModeration/helpers";
import type { PersistedModerationBase } from "@oakai/core/src/utils/ailaModeration/moderationSchema";
import { Dialog } from "@radix-ui/themes";
import { useModerationFeedbackSurvey } from "hooks/surveys/useModerationFeedbackSurvey";

import Button from "@/components/Button";
import { Icon } from "@/components/Icon";

import ChatButton from "../Chat/ui/chat-button";
import { Textarea } from "../Chat/ui/textarea";

export type ModerationFeedbackFormProps = Readonly<{
  chatId: string;
  moderation: PersistedModerationBase;
  closeModal: () => void;
}>;

export const ModerationFeedbackForm = ({
  chatId,
  moderation,
  closeModal,
}: ModerationFeedbackFormProps) => {
  const { onSubmit, comment, setComment, isValid, hasSubmitted } =
    useModerationFeedbackSurvey({
      chatId,
      moderation,
    });

  useEffect(() => {
    if (hasSubmitted) {
      closeModal();
    }
  }, [hasSubmitted, closeModal]);

  return (
    <div className="flex max-w-[600px] flex-col  gap-13 overflow-y-scroll bg-white p-18 sm:m-18 sm:border-2 sm:border-gray-900">
      <div className="flex justify-between">
        <Icon icon="warning" size="md" />
        <Button
          icon="cross"
          variant="icon-only"
          onClick={closeModal}
          title="Close modal"
        />
      </div>
      <Dialog.Close />
      <div className="flex flex-col gap-8">
        <Dialog.Title>
          <span className="font-bold">Guidance required</span>
        </Dialog.Title>
        <Dialog.Description>
          <span>
            Contains{" "}
            {moderation.categories.map(moderationSlugToDescription).join(", ")}.
            Check content carefully. If you have feedback on this guidance,
            please provide details below.
          </span>
        </Dialog.Description>
      </div>
      <form onSubmit={onSubmit}>
        <Textarea
          className="min-h-30 w-full resize-none rounded border border-gray-600 bg-transparent px-10 py-[0.6rem] text-base placeholder-gray-700 focus-within:outline-none"
          onChange={(e) => setComment(e.target.value)}
          value={comment}
          placeholder="Your feedback"
        />
      </form>
      <div className="flex w-full justify-between gap-7">
        <ChatButton variant="text-link" onClick={closeModal}>
          Back to lesson
        </ChatButton>
        <ChatButton variant="primary" onClick={onSubmit} disabled={!isValid}>
          Submit feedback
        </ChatButton>
      </div>
    </div>
  );
};
