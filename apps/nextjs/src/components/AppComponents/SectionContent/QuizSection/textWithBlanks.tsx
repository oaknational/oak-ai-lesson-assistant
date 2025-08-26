import { useMemo } from "react";
import type { Components } from "react-markdown";

import { OakSpan } from "@oaknational/oak-components";

// Blank patterns that we support
const BLANK_PATTERNS = {
  CURLY_BRACES: /\{\{ ?\}\}/g,
  UNDERSCORES: /_{4,}/g,
} as const;

export const hasBlankSpaces = (text: string): boolean => {
  return (
    BLANK_PATTERNS.CURLY_BRACES.test(text) ||
    BLANK_PATTERNS.UNDERSCORES.test(text)
  );
};

/**
 * Prepares text for markdown processing by standardizing all blanks to {{}}
 * and wrapping them in italic markers so they can be intercepted by custom components
 */
export const prepareTextWithBlanks = (text: string): string => {
  return text
    .replace(BLANK_PATTERNS.CURLY_BRACES, "_{{}}_")
    .replace(BLANK_PATTERNS.UNDERSCORES, "_{{}}_");
};

/**
 * Creates custom markdown components that render blanks as underlined elements
 */
export const createBlankComponents = (
  answer?: string,
): Partial<Components> => ({
  em: ({ children }) => {
    const content = children?.toString();

    const isBlank = content === "{{}}";

    if (isBlank) {
      const displayText = answer || "";
      const ariaLabel = answer
        ? `blank filled with: ${answer}`
        : "blank to be filled";

      return (
        <OakSpan
          $ba="border-solid-m"
          $borderColor="border-primary"
          $font="body-2-bold"
          $color={answer ? "text-success" : "text-primary"}
          $borderStyle="none none solid none"
          $minWidth="all-spacing-5"
          $display="inline-block"
          $textAlign="center"
          aria-label={ariaLabel}
          role="insertion"
        >
          {displayText}
        </OakSpan>
      );
    }

    // Regular italic text
    return <em>{children}</em>;
  },
});

type TextWithBlanksOptions = {
  /** The question text that may contain blanks like {{}} or _____ */
  questionText: string;
  /** Optional answer to fill blanks with. If not provided, blanks render as empty underlined spaces */
  fillAnswer?: string;
};

export const useTextWithBlanks = (options: TextWithBlanksOptions) => {
  const { questionText, fillAnswer } = options;

  const processedText = useMemo(
    () => prepareTextWithBlanks(questionText),
    [questionText],
  );

  const components = useMemo(
    () => createBlankComponents(fillAnswer),
    [fillAnswer],
  );

  return { processedText, components };
};
