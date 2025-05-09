import { OakFlex, OakLink, OakP } from "@oaknational/oak-components";

import { Icon } from "@/components/Icon";

import { Message } from "../Chat/chat-message/layout";
import { useDialog } from "../DialogContext";

export function ModerationMessage() {
  const { setDialogWindow } = useDialog();
  return (
    <Message.Container roleType="moderation">
      <Message.Content>
        <OakFlex className="flex items-center">
          <Icon icon="warning" size="sm" className="mr-6" />
          <OakP $font={"body-2"}>
            {`This content may need additional guidance. `}
            <OakLink
              onClick={() => setDialogWindow("additional-materials-moderation")}
              color={"primary"}
            >
              Click here for guidance details.
            </OakLink>
          </OakP>
        </OakFlex>
      </Message.Content>
    </Message.Container>
  );
}
