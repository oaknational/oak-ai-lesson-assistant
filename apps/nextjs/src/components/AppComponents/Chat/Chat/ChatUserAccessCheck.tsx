import React from "react";

import { Flex } from "@radix-ui/themes";

export interface ChatUserAccessCheckProps {
  userCanView: boolean;
  children: React.ReactNode;
}

const ChatUserAccessCheck: React.FC<ChatUserAccessCheckProps> = ({
  userCanView,
  children,
}) => {
  if (!userCanView) {
    return (
      <Flex
        grow={"1"}
        width="100%"
        height="100%"
        justify="center"
        align="center"
      >
        <p className="mt-18 py-12">
          Sorry, you do not have permission to view this page.
        </p>
      </Flex>
    );
  }

  return <>{children}</>;
};

export default ChatUserAccessCheck;
