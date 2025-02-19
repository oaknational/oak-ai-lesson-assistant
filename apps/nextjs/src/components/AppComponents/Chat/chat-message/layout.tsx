import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type MessageContainerProps = Readonly<{
  children: ReactNode;
  roleType: "user" | "aila" | "moderation" | "error";
  className?: string;
}>;

const roleClassNames = {
  user: "bg-teachersLilac p-9",
  aila: "",
  moderation: "bg-videoBlue p-9",
  error: "bg-peachCream p-9",
};

function MessageSpacingWrapper({ children }: { children: ReactNode }) {
  return <div className="w-full flex-col gap-11">{children}</div>;
}

function MessageContainer({
  children,
  roleType,
  className,
}: MessageContainerProps) {
  const testId = `chat-message-wrapper-${roleType}`;
  return (
    <div
      className={cn(
        "relative mt-20 w-full items-start rounded-md",
        roleClassNames[roleType],
        className,
      )}
      data-testid={testId}
    >
      {children}
    </div>
  );
}

function MessageContent({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex w-full flex-col items-start justify-between">
      {children}
    </div>
  );
}

export const Message = {
  Spacing: MessageSpacingWrapper,
  Container: MessageContainer,
  Content: MessageContent,
};
