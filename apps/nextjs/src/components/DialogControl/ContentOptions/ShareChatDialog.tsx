import { useCallback } from "react";

import type { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";

import {
  OakBox,
  OakFlex,
  OakP,
  OakPrimaryButton,
} from "@oaknational/oak-components";
import * as Sentry from "@sentry/react";
import Link from "next/link";

import type { DialogTypes } from "@/components/AppComponents/Chat/Chat/types";
import LoadingWheel from "@/components/LoadingWheel";
import { getLessonTrackingProps } from "@/lib/analytics/helpers";
import useAnalytics from "@/lib/analytics/useAnalytics";
import { getAilaUrl } from "@/utils/getAilaUrl";
import { trpc } from "@/utils/trpc";

import ModalFooterButtons from "./ModalFooterButtons";

type ShareChatProps = {
  chatId: string;
  setOpenExportDialog: (open: DialogTypes) => void;
  lesson: LooseLessonPlan;
  isShared: boolean | undefined;
};

const ShareChat = ({
  chatId,
  setOpenExportDialog,
  lesson,
  isShared,
}: Readonly<ShareChatProps>) => {
  const closeDialog = useCallback(() => {
    setOpenExportDialog("");
  }, [setOpenExportDialog]);

  const { track } = useAnalytics();
  const { mutateAsync, isSuccess, isLoading, isError } =
    trpc.chat.appSessions.shareChat.useMutation();

  const attemptToShareChat = useCallback(() => {
    mutateAsync({ id: chatId })
      .then(() => {
        track.lessonPlanShared({
          ...getLessonTrackingProps({ lesson }),
          chatId,
          componentType: "go_to_share_page_button",
        });
      })
      .catch((error) => {
        Sentry.captureException(error, { extra: { chatId } });
      });
  }, [track, lesson, chatId, mutateAsync]);

  function renderShareButton() {
    if (isLoading) {
      return (
        <OakFlex $justifyContent="center" $alignItems="center">
          <LoadingWheel />
        </OakFlex>
      );
    } else if (isSuccess || isShared) {
      return (
        <OakPrimaryButton
          element={Link}
          href={`${getAilaUrl("lesson")}/${chatId}/share`}
          target="_blank"
          iconName="external"
          isTrailingIcon={true}
        >
          View share page
        </OakPrimaryButton>
      );
    }
    return (
      <OakPrimaryButton onClick={attemptToShareChat} disabled={isLoading}>
        Create shareable link
      </OakPrimaryButton>
    );
  }

  return (
    <OakFlex
      data-testid="chat-share-dialog"
      $width="100%"
      $height="100%"
      $flexDirection="column"
      $justifyContent="space-between"
    >
      <OakBox>
        <OakP $textAlign="center" $mb={"space-between-l"}>
          Content generated by Aila should be reviewed and adapted to ensure
          accuracy and relevance before sharing.
          <br />
          <br /> If you make any updates to this lesson, the share page content
          will also update.
        </OakP>
      </OakBox>
      <ModalFooterButtons
        closeDialog={closeDialog}
        actionButtonStates={renderShareButton}
      />
      {isError && <p>There was an error sharing the chat.</p>}
    </OakFlex>
  );
};

export default ShareChat;
