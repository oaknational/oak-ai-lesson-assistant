import { OakBox, OakFlex, OakIcon, OakSpan } from "@oaknational/oak-components";
import Link from "next/link";

import { useDemoUser } from "@/components/ContextProviders/Demo";
import { useChatStore, useLessonPlanStore } from "@/stores/AilaStoresProvider";

import { useDialog } from "../../DialogContext";
import { useProgressForDownloads } from "../Chat/hooks/useProgressForDownloads";

export const useShowDownloadButtons = () => {
  const stableMessages = useChatStore((state) => state.stableMessages);
  const lessonPlan = useLessonPlanStore((state) => state.lessonPlan);
  const isStreaming = useChatStore(
    (state) => state.ailaStreamingStatus !== "Idle",
  );

  const { totalSections, totalSectionsComplete } = useProgressForDownloads({
    lessonPlan,
    isStreaming,
  });

  if (totalSectionsComplete < totalSections) {
    return stableMessages.some(
      ({ role, content }) =>
        role !== "user" &&
        content.includes("download") &&
        (content.includes("slides") || content.includes("share")),
    );
  }
};

export const InChatDownloadButtons = () => {
  const demo = useDemoUser();
  const { setDialogWindow } = useDialog();
  const id = useLessonPlanStore((state) => state.id);

  return (
    <OakFlex $flexDirection="column" $gap="all-spacing-7" $mv="space-between-l">
      {demo.isSharingEnabled && (
        <Link
          href={demo.isSharingEnabled ? `/aila/download/${id}` : "#"}
          onClick={() => {
            if (!demo.isSharingEnabled) {
              setDialogWindow("demo-share-locked");
            }
          }}
        >
          <InnerInChatButton iconName="download">Download</InnerInChatButton>
        </Link>
      )}
      <button
        onClick={() => {
          if (demo.isSharingEnabled) {
            setDialogWindow("share-chat");
          } else {
            setDialogWindow("demo-share-locked");
          }
        }}
      >
        <InnerInChatButton iconName="share">Share</InnerInChatButton>
      </button>
    </OakFlex>
  );
};

const InnerInChatButton = ({
  iconName,
  children,
}: {
  readonly iconName: "download" | "share";
  readonly children: string;
}) => {
  return (
    <OakFlex
      $pa="inner-padding-m"
      $gap="all-spacing-3"
      $background="white"
      $borderRadius="border-radius-m"
      $alignItems="center"
      $dropShadow="drop-shadow-standard"
    >
      <OakBox $transform="scale">
        <OakIcon iconName={iconName} $width="all-spacing-7" />
      </OakBox>
      <OakSpan $font="body-2">{children}</OakSpan>
    </OakFlex>
  );
};
