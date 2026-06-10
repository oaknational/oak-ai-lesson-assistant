import { OakLink, OakP, OakSecondaryLink } from "@oaknational/oak-components";

const ChatPanelDisclaimer = () => {
  return (
    <OakP $font="body-3" $textAlign="center">
      AI can make mistakes. Review content before use. Read our{" "}
      <OakLink
        href="https://www.thenational.academy/legal/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
      >
        privacy policy
      </OakLink>{" "}
      and{" "}
      <OakLink
        href="https://www.thenational.academy/legal/terms-and-conditions"
        target="_blank"
        rel="noopener noreferrer"
      >
        terms and conditions
      </OakLink>
      .
    </OakP>
  );
};

export default ChatPanelDisclaimer;
