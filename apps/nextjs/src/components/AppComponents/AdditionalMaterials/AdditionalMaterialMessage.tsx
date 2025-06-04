import { OakFlex, OakIcon, OakLink, OakP } from "@oaknational/oak-components";

import { Message } from "../Chat/chat-message/layout";
import { useDialog } from "../DialogContext";

export function ModerationMessage() {
  const { setDialogWindow } = useDialog();
  return (
    <Message.Container roleType="moderation">
      <Message.Content>
        <OakFlex $alignItems={"center"}>
          <OakIcon $colorFilter="black" iconName="info" alt="" />
          <OakP $ml="space-between-xs" $font={"body-3"}>
            {`This lesson may need additional `}
            <OakLink
              onClick={() => setDialogWindow("additional-materials-moderation")}
              color={"primary"}
            >
              content guidance.
            </OakLink>
          </OakP>
        </OakFlex>
      </Message.Content>
    </Message.Container>
  );
}
