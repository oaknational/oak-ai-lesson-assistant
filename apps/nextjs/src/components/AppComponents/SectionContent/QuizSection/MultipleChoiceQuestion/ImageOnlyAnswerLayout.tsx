import { useMemo } from "react";
import type { Components } from "react-markdown";

import { OakBox, OakFlex } from "@oaknational/oak-components";

import { MemoizedReactMarkdownWithStyles } from "@/components/AppComponents/Chat/markdown";

import { AnswerBox } from "../AnswerBox";

type ImageOnlyAnswerLayoutProps = {
  answers: Array<{ text: string; isCorrect: boolean }>;
};

export const ImageOnlyAnswerLayout = ({
  answers,
}: ImageOnlyAnswerLayoutProps) => {
  // Custom image component for 4-column layout with smaller dimensions
  const imageComponents: Partial<Components> = useMemo(
    () => ({
      img: ({ src, alt, title }) => {
        return (
          <img
            src={src}
            alt={alt}
            title={title}
            className="aspect-[4/3] h-auto w-full max-w-full object-contain"
          />
        );
      },
    }),
    [],
  );

  return (
    <OakFlex $flexWrap="wrap" $gap="spacing-12">
      {answers.map((answer, index) => {
        const letter = String.fromCharCode(97 + index);
        return (
          <OakFlex
            key={index}
            $flexDirection="column"
            className="w-full max-w-[200px] md:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
          >
            {/* Image section - grows to fill space */}
            <OakFlex
              $flexGrow={1}
              $alignItems="center"
              $justifyContent="center"
              $mb="spacing-12"
            >
              <MemoizedReactMarkdownWithStyles
                markdown={answer.text}
                className="not-prose"
                components={imageComponents}
              />
            </OakFlex>

            {/* Checkbox section - stays at bottom */}
            <OakFlex $alignItems="center" $justifyContent="flex-start">
              <AnswerBox>{answer.isCorrect && <AnswerBox.Check />}</AnswerBox>
              <OakBox $font="body-2">{letter})</OakBox>
            </OakFlex>
          </OakFlex>
        );
      })}
    </OakFlex>
  );
};
