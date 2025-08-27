import { useMemo } from "react";
import type { Components } from "react-markdown";

import { OakBox } from "@oaknational/oak-components";

// Blank patterns that we support
// NOTE: Don't use /g flags as they are stateful when tested multiple times
const BLANK_PATTERNS = {
  CURLY_BRACES: /\{\{ ?\}\}/,
  UNDERSCORES: /_{3,}/,
} as const;

export const hasBlankSpaces = (text: string): boolean => {
  return (
    BLANK_PATTERNS.CURLY_BRACES.test(text) ||
    BLANK_PATTERNS.UNDERSCORES.test(text)
  );
};

/**
 * Prepares text for markdown processing by standardizing all blanks to {{}}
 * and wrapping them in emphasis markers so they can be intercepted by custom components.
 * Handles special cases where adjacent symbols would break markdown parsing.
 */
export const prepareTextWithBlanks = (text: string): string => {
  // 1: wrap all blanks in emphasis markers
  let result = text
    .replace(BLANK_PATTERNS.CURLY_BRACES, "_{{}}_")
    .replace(BLANK_PATTERNS.UNDERSCORES, "_{{}}_");

  // 2: move degree symbol inside emphasis markers so markdown parser recognizes them.
  // _{{}}_° becomes _{{}}°_ because markdown requires word boundaries around markers
  return result.replace("_{{}}_°", "_{{}}°_");
};

/**
 * Creates custom markdown components that render blanks as underlined elements
 */
export const createBlankComponents = (
  answer?: string,
): Partial<Components> => ({
  em: ({ children }) => {
    const content = children?.toString();

    const isBlank = content === "{{}}" || content === "{{}}°";

    if (isBlank) {
      const hasDegreeSymbol = content === "{{}}°";
      const ariaLabel = answer
        ? `blank filled with: ${answer}${hasDegreeSymbol ? "°" : ""}`
        : "blank to be filled";

      return (
        <>
          <OakBox
            $ba="border-solid-m"
            $borderColor="border-primary"
            $font="body-2-bold"
            $color={answer ? "text-success" : "text-primary"}
            $borderStyle="none none solid none"
            {...(!answer && { $pl: "inner-padding-xl5" })}
            $display="inline"
            $textAlign="center"
            aria-label={ariaLabel}
            role="insertion"
            as="span"
          >
            {answer}
          </OakBox>
          {hasDegreeSymbol ? "°" : ""}
        </>
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
