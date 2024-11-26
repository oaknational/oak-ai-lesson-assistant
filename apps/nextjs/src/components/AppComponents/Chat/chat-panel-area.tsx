import { useDemoUser } from "@/components/ContextProviders/Demo";

export type ChatPanelAreaProps = Readonly<{
  children: React.ReactNode;
  chatAreaRef?: React.RefObject<HTMLDivElement>;
  isDemoLocked: boolean;
}>;

export const ChatPanelArea = ({
  children,
  chatAreaRef,
  isDemoLocked,
}: ChatPanelAreaProps) => {
  const demo = useDemoUser();

  return (
    <div
      ref={chatAreaRef}
      className={`relative mb-11 h-[calc(100vh-428px)] ${demo.isDemoUser && !isDemoLocked ? "sm:h-[calc(100vh-448px)]" : "sm:h-[calc(100vh-400px)]"} w-[calc(100%+12px)] overflow-y-auto rounded-tl-lg rounded-tr-lg pr-9 `}
    >
      {children}
    </div>
  );
};
