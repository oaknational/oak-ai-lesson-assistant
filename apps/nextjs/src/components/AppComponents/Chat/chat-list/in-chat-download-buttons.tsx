import { OakBox, OakFlex, OakIcon, OakSpan } from "@oaknational/oak-components";
import Link from "next/link";

import { useDemoUser } from "@/components/ContextProviders/Demo";

import { useDialog } from "../../DialogContext";

export const InChatDownloadButtons = ({ id }: { readonly id: string }) => {
  const demo = useDemoUser();
  const { setDialogWindow } = useDialog();

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
