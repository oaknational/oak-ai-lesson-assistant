import { OakFlex, OakIcon, OakLink, OakP } from "@oaknational/oak-components";

import { Message } from "../Chat/chat-message/layout";
import { useDialog } from "../DialogContext";

export function ModerationMessage() {
  const { setDialogWindow } = useDialog();
  return (
    <Message.Container roleType="moderation">
      <Message.Content>
        <OakFlex $alignItems={"center"}>
          <OakIcon $colorFilter="icon-primary" iconName="info" alt="" />
          <OakP $ml="spacing-12" $font={"body-3"}>
            {`This lesson may need additional `}
            <OakLink
              element="button"
              aria-label="Open content guidance dialog"
              onClick={() => setDialogWindow("teaching-materials-moderation")}
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
