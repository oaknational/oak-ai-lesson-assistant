import type { FC } from "react";
import { useState } from "react";

import { OakFlex } from "@oaknational/oak-components";

import QuizOakImage from "../QuizOakImage";
import type { StemImageObject } from "../quizTypes";
import { calcDims } from "../quizUtils";

type ImageProps = { src: StemImageObject["imageObject"]; alt?: string };

const QuizImage: FC<ImageProps> = ({ src, alt }) => {
  const [dims, setDims] = useState(calcDims(src.width, src.height));

  return (
    <OakFlex
      $overflow={"hidden"}
      $position={"relative"}
      $minWidth={dims.width ? undefined : "all-spacing-14"}
      $minHeight={dims.height ? undefined : "all-spacing-14"}
      $justifyContent={"center"}
    >
      <QuizOakImage src={src} dims={dims} setDims={setDims} alt={alt} />
    </OakFlex>
  );
};

export default QuizImage;
