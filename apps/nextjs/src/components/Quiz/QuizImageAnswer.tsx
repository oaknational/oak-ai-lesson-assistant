import type { FC } from "react";
import { useState } from "react";

import { OakFlex, OakIcon } from "@oaknational/oak-components";
import { VisuallyHidden } from "@radix-ui/themes";

import type { QuizV2ImageObject } from "@oakai/aila/src/protocol/schemas";

import QuizOakImage from "./QuizOakImage";
import { calcDims, removeMarkdown } from "./utils";

type ImageProps = {
  src: QuizV2ImageObject;
  alt?: string;
  answerIsCorrect?: boolean;
};

const QuizImageAnswer: FC<ImageProps> = ({ src, alt, answerIsCorrect }) => {
  const [dims, setDims] = useState(calcDims(src.width, src.height));
  const containerBackgroundColor = answerIsCorrect ? "lemon50" : "white";
  return (
    <OakFlex
      // $borderRadius={8}
      $height={"100%"}
      // $pa={8}
      $background={containerBackgroundColor}
    >
      {answerIsCorrect && (
        <VisuallyHidden>Correct Answer: {removeMarkdown(alt)}</VisuallyHidden>
      )}
      <OakFlex
        $background={containerBackgroundColor}
        $alignItems={"center"}
        // $minWidth={32}
        aria-hidden
      >
        {answerIsCorrect && (
          <OakIcon
            data-testid={"answer-tick"}
            iconName={"tick"}
            $width={"all-spacing-6"}
            $height={"all-spacing-6"}
          />
        )}
      </OakFlex>
      <OakFlex
        // $ba={1}
        $background={"white"}
        // $borderRadius={8}
      >
        <OakFlex
          // $ph={10}
          // $pv={16}
          $overflow={"hidden"}
          $position={"relative"}
          // $minWidth={dims.width ? undefined : 96}
          // $minHeight={dims.height ? undefined : 96}
          $justifyContent={"center"}
          $borderColor={"grey50"}
          // $borderRadius={8}
        >
          <QuizOakImage src={src} dims={dims} setDims={setDims} alt={alt} />
        </OakFlex>
      </OakFlex>
    </OakFlex>
  );
};

export default QuizImageAnswer;
