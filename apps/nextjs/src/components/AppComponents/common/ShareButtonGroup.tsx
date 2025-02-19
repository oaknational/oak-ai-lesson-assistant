import { Box } from "@radix-ui/themes";

import { Icon } from "@/components/Icon";

import ChatButton from "../Chat/ui/chat-button";

type ShareButtonGroupProps = {
  loading: boolean;
  shareContent: () => void;
  shareId: string | null;
  shareText?: string;
  app: "lesson-planner" | "quiz-designer";
  disabled?: boolean;
};
const ShareButtonGroup = ({
  loading,
  shareContent,
  shareId,
  shareText,
  app,
  disabled,
}: Readonly<ShareButtonGroupProps>) => {
  if (loading) {
    return (
      <Box>
        <div className="flex w-fit min-w-18">
          <Icon
            icon="reload"
            size="md"
            color="black"
            className="animate-spin"
          />
        </div>
      </Box>
    );
  }
  if (shareId) {
    return (
      <ChatButton
        variant="primary"
        href={`/${app}/preview/${shareId}`}
        target="_blank"
        icon="external"
      >
        Go to share link
      </ChatButton>
    );
  }
  return (
    <ChatButton
      variant="primary"
      onClick={() => {
        shareContent();
      }}
      icon="share"
      disabled={disabled}
    >
      {shareText ?? "Share"}
    </ChatButton>
  );
};

export default ShareButtonGroup;
