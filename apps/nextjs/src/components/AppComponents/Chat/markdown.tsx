import type { FC } from "react";
import React, { memo, useMemo } from "react";
import type { Components, Options } from "react-markdown";
import ReactMarkdown from "react-markdown";

import * as Tooltip from "@radix-ui/react-tooltip";
import { Box, Flex } from "@radix-ui/themes";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

import { CodeBlock } from "./ui/codeblock";

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.className === nextProps.className,
);

export type ReactMarkdownWithStylesProps = Readonly<{
  markdown: string;
  lessonPlanSectionDescription?: string;
  className?: string;
}>;

const createComponents = (
  className?: string,
  lessonPlanSectionDescription?: string,
): Partial<Components> => ({
  li: ({ children }) => (
    <li className={cn("marker:text-black", className)}>{children}</li>
  ),
  p: ({ children }) => (
    <p className={cn("mb-7 last:mb-0", className)}>{children}</p>
  ),
  h1: ({ children }) => (
    <Flex align="center" gap="3" className="mt-20">
      <Box>
        <h2 className="mb-0 mt-0 text-xl font-bold">{children}</h2>
      </Box>
      {!!lessonPlanSectionDescription && (
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Box className="mb-0 mt-0 ">
                <button className="my-0 flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-full bg-black p-4 ">
                  <span className=" p-3 text-xs text-white">i</span>
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
  ),
  code: (props) => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      node,
      className,
      children,
      inline,
      ...restProps
    } = props as {
      node?: React.ReactNode;
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    };
    if (children && Array.isArray(children) && children.length) {
      if (children[0] == "▍") {
        return <span className="mt-5 animate-pulse cursor-default">▍</span>;
      }

      children[0] = (children[0] as string).replace("`▍`", "▍");
    }

    const match = /language-(\w+)/.exec(className ?? "");

    if (inline) {
      return (
        <code className={className} {...restProps}>
          {children}
        </code>
      );
    }

    return (
      <CodeBlock
        key={Math.random()}
        language={match?.[1] ?? ""}
        value={String(children).replace(/\n$/, "")}
        {...restProps}
      />
    );
  },
  a: ({ children, href }) => {
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
});

export const MemoizedReactMarkdownWithStyles = ({
  markdown,
  lessonPlanSectionDescription,
  className,
}: ReactMarkdownWithStylesProps) => {
  const components: Partial<Components> = useMemo(() => {
    return createComponents(className, lessonPlanSectionDescription);
  }, [className, lessonPlanSectionDescription]);
  return (
    <MemoizedReactMarkdown
      className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {markdown}
    </MemoizedReactMarkdown>
  );
};
