import ChatButton from "./ui/chat-button";

export const MobileSupportBlocker = () => {
  return (
    <div
      className="mt-40 flex h-full w-full flex-col items-center justify-center gap-11 bg-white  p-20 text-black md:hidden"
      data-testid="mobile-support-blocker"
    >
      <p className="md:hidden">
        This AI lesson planning assistant is not currently available on mobile.
        Please use a desktop to access this tool.
      </p>
      <ChatButton href="/" variant="secondary">
        AI Experiments
      </ChatButton>
    </div>
  );
};
