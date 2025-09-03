import type { FC } from "react";
import React, { memo, useMemo } from "react";
import type { Components, Options } from "react-markdown";
import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

import { CodeBlock } from "./ui/codeblock";

const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) =>
    prevProps.children === nextProps.children &&
    prevProps.components === nextProps.components &&
    prevProps.className === nextProps.className,
);

export type ReactMarkdownWithStylesProps = Readonly<{
  markdown: string;
  lessonPlanSectionDescription?: string;
  className?: string;
  components?: Partial<Components>;
}>;

// This could do with further refactoring to make it more readable
const createComponents = (className?: string): Partial<Components> => ({
  li: ({ children }) => (
    <li className={cn("marker:text-black", className)}>{children}</li>
  ),
  p: ({ children }) => (
    <p className={cn("mb-7 last:mb-0", className)}>{children}</p>
  ),
  h1: ({ children }) => (
    <h2 className="mb-0 mt-20 text-xl font-bold">{children}</h2>
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
  img: ({ src, alt, title }) => {
    // Apply fixed max dimensions to all images
    return (
      <img
        src={src}
        alt={alt}
        title={title}
        className="h-auto max-h-[200px] w-auto max-w-[250px] object-contain"
      />
    );
  },
});

export const MemoizedReactMarkdownWithStyles = ({
  markdown,
  className,
  components: customComponents,
}: ReactMarkdownWithStylesProps) => {
  const components: Partial<Components> = useMemo(() => {
    const defaultComponents = createComponents(className);
    return customComponents
      ? { ...defaultComponents, ...customComponents }
      : defaultComponents;
  }, [className, customComponents]);
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
