import type {
  ErrorDocument,
  MessagePart,
  PromptDocument,
  TextDocument,
} from "@oakai/aila/src/protocol/jsonPatchProtocol";
import { aiLogger } from "@oakai/logger";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import type { ModerationModalHelpers } from "../../FeedbackForms/ModerationFeedbackModal";

const log = aiLogger("chat");

const components = {
  comment: NonRenderedPart,
  prompt: PromptMessagePart,
  error: ErrorMessagePart,
  bad: NonRenderedPart,
  patch: NonRenderedPart,
  /**
   * Patches do not get rendered, they get applied to the lesson plan
   * state, which is then rendered in the right hand side.
   */
  experimentalPatch: NonRenderedPart,
  state: NonRenderedPart,
  text: TextMessagePart,
  action: NonRenderedPart,
  moderation: NonRenderedPart,
  id: NonRenderedPart,
  unknown: NonRenderedPart,
};

export interface ChatMessagePartProps {
  part: MessagePart;
  inspect: boolean;
  moderationModalHelpers: ModerationModalHelpers;
}

export function ChatMessagePart({
  part,
  inspect,
}: Readonly<ChatMessagePartProps>) {
  const PartComponent = components[part.document.type] as React.ComponentType<{
    part: typeof part.document;
  }>;

  if (!PartComponent) {
    log.info("Unknown part type", part.document.type, JSON.stringify(part));
    return null;
  }

  return (
    <div className="w-full">
      <PartComponent part={part.document} />

      {inspect && <PartInspector part={part} />}
    </div>
  );
}

function NonRenderedPart() {
  return null;
}

function PromptMessagePart({ part }: Readonly<{ part: PromptDocument }>) {
  return <MemoizedReactMarkdownWithStyles markdown={part.message} />;
}

function ErrorMessagePart({
  part,
}: Readonly<{
  part: ErrorDocument;
}>) {
  const markdown = part.message ?? "Sorry, an error has occurred";
  return <MemoizedReactMarkdownWithStyles markdown={markdown} />;
}

function TextMessagePart({ part }: Readonly<{ part: TextDocument }>) {
  return <MemoizedReactMarkdownWithStyles markdown={part.value} />;
}

function PartInspector({ part }: Readonly<{ part: MessagePart }>) {
  return (
    <div className="w-full bg-gray-200 px-8 py-16">
      <pre className="w-full text-wrap text-xs">
        {JSON.stringify(part, null, 2)}
      </pre>
    </div>
  );
}
