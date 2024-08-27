import { useDemoUser } from "@/components/ContextProviders/Demo";

export const ChatPanelArea = ({
  children,
  chatAreaRef,
  isDemoLocked,
}: {
  children: React.ReactNode;
  chatAreaRef?: React.RefObject<HTMLDivElement>;
  isDemoLocked: boolean;
}) => {
  const demo = useDemoUser();

  return (
    <div
      ref={chatAreaRef}
      className={`relative mb-11 ${demo.isDemoUser && !isDemoLocked ? "h-[calc(100vh-448px)]" : "h-[calc(100vh-400px)]"} w-[calc(100%+12px)] overflow-y-auto rounded-tl-lg rounded-tr-lg pr-9 `}
    >
      {children}
    </div>
  );
};
