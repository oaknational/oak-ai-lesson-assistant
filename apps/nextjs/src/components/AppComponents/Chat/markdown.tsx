import type { FC } from "react";
import React, { memo, useCallback, useMemo } from "react";
import type { Options } from "react-markdown";
import ReactMarkdown from "react-markdown";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Box, Flex } from "@radix-ui/themes";
import remarkGfm from "remark-gfm";

import { useLessonChat } from "@/components/ContextProviders/ChatProvider";
import { cn } from "@/lib/utils";

import { CodeBlock } from "./ui/codeblock";

// Memoized Component
const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);

export const MemoizedReactMarkdownWithStyles = ({
  markdown,
  shouldTransformToButtons = false,
  lessonPlanSectionDescription,
  className,
}: {
  markdown: string;
  shouldTransformToButtons?: boolean;
  lessonPlanSectionDescription?: string;
  className?: string;
}) => {
  // Memoize the chat to avoid re-renders on context updates
  const chat = useLessonChat();
  const { append } = chat;

  // Memoize the markdown content to avoid recalculating if it hasn't changed
  const memoizedMarkdown = useMemo(() => markdown, [markdown]);

  // UseCallback to avoid inline function recreation
  const handleAppend = useCallback(
    (content: string) => append({ content, role: "user" }),
    [append],
  );

  return (
    <MemoizedReactMarkdown
      className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
      remarkPlugins={[remarkGfm]}
      components={{
        ol({ children }) {
          if (shouldTransformToButtons) {
            return (
              <ol className="m-0 list-none p-0">
                {React.Children.map(children, (child) => {
                  if (!child || child === "\n") return null;
                  return child;
                })}
              </ol>
            );
          }
          return (
            <ol className={cn("marker:text-black", className)}>{children}</ol>
          );
        },
        li({ children }) {
          if (shouldTransformToButtons) {
            return (
              <li className="m-0 p-0">
                <InLineButton
                  text={String(children)}
                  onClick={() => handleAppend(String(children))}
                />
              </li>
            );
          }
          return (
            <li className={cn("marker:text-black", className)}>{children}</li>
          );
        },
        p({ children }) {
          if (
            Array.isArray(children) &&
            (children[children.length - 1]?.includes(
              "proceed to the final step",
            ) ||
              children[children.length - 1]?.includes(
                "move on to the final step",
              ) ||
              children[children.length - 1]?.includes(
                "complete the lesson plan",
              ))
          ) {
            const text = children.slice(0, -2)[0].split("Otherwise, tap")[0];
            return (
              <div className="flex flex-col gap-5">
                <p className={cn("mb-7 last:mb-0", className)}>{text}</p>
                <InLineButton
                  onClick={() => handleAppend("Proceed to the final step")}
                  text="Proceed to the final step"
                />
              </div>
            );
          }
          if (
            Array.isArray(children) &&
            (children[children.length - 1]?.includes(
              "proceed to the next step",
            ) ||
              children[children.length - 1]?.includes(
                "move on to the next step",
              ) ||
              children[children.length - 3]?.includes("Otherwise, tap"))
          ) {
            const text = children.slice(0, -2)[0].split("Otherwise, tap")[0];
            return (
              <div className="flex flex-col gap-5">
                <p className={cn("mb-7 last:mb-0", className)}>{text}</p>
                <InLineButton
                  onClick={() => handleAppend("Proceed to the next step")}
                  text="Proceed to the next step"
                />
              </div>
            );
          }

          if (
            Array.isArray(children) &&
            children[2]?.includes("start from scratch")
          ) {
            return (
              <div className="flex flex-col gap-5">
                <p className={cn("mb-7 last:mb-0", className)}>
                  If not, ask me something or else, or:
                </p>
                <InLineButton
                  onClick={() => handleAppend("Continue from scratch")}
                  text="Continue from scratch"
                />
              </div>
            );
          }
          return <p className={cn("mb-7 last:mb-0", className)}>{children}</p>;
        },
        h1({ children }) {
          return (
            <Flex align="center" gap="3" className="mt-20">
              <Box>
                <h2 className="mb-0 mt-0 text-xl font-bold">{children}</h2>
              </Box>
              {lessonPlanSectionDescription && (
                <Tooltip.Provider delayDuration={0}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Box className="mb-0 mt-0 ">
                        <button className="my-0 flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-full bg-black p-4 ">
                          <span className="p-3 text-xs text-white">i</span>
                        </button>
                      </Box>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="max-w-[300px] rounded-lg bg-black p-7 text-center text-sm text-white"
                        sideOffset={5}
                      >
                        {lessonPlanSectionDescription}
                        <Tooltip.Arrow className="TooltipArrow" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
            </Flex>
          );
        },
        code(props) {
          const { className, children, ...restProps } = props;
          if (children && Array.isArray(children) && children.length) {
            if (children[0] === "▍") {
              return (
                <span className="mt-5 animate-pulse cursor-default">▍</span>
              );
            }
            children[0] = (children[0] as string).replace("`▍`", "▍");
          }

          const match = /language-(\w+)/.exec(className || "");

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
              {...restProps}
            />
          );
        },
        a({ children, href }) {
          const isExternal = href?.startsWith("http");
          const tags = isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <a href={href} {...tags}>
              {children}
            </a>
          );
        },
      }}
    >
      {memoizedMarkdown}
    </MemoizedReactMarkdown>
  );
};

const InLineButton = memo(
  ({ text, onClick }: { text: string; onClick: () => void }) => {
    return (
      <button
        onClick={onClick}
        className="my-6 w-fit border-spacing-4 rounded-lg border border-black border-opacity-30 bg-white p-7 text-blue"
      >
        {text}
      </button>
    );
  },
);
