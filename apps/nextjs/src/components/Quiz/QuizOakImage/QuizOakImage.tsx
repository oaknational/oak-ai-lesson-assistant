import type { Dispatch, FC, SetStateAction } from "react";

import { OakImage } from "@oaknational/oak-components";
import type { QuizV2ImageObject } from "@oakai/aila/src/protocol/schemas";

import { calcDims } from "../quizUtils";

type QuizOakImageProps = {
  src: QuizV2ImageObject;
  alt?: string;
  dims:
    | {
        width: number;
        height: number;
      }
    | {
        width: undefined;
        height: undefined;
      };
  setDims: Dispatch<
    SetStateAction<
      | {
          width: number;
          height: number;
        }
      | {
          width: undefined;
          height: undefined;
        }
    >
  >;
};

const QuizOakImage: FC<QuizOakImageProps> = ({ src, alt, dims, setDims }) => {
  return dims.width && dims.height ? (
    <OakImage
      // $objectPosition={["center", "left"]}
      width={dims.width}
      height={dims.height}
      src={src.url}
      alt={alt ?? ""}
      style={{ objectFit: "contain" }}
    />
  ) : (
    <OakImage
      // $objectPosition={["center", "left"]}
      fill
      src={src.url}
      alt={alt ?? ""}
      style={{ objectFit: "contain" }}
      onLoad={(e) => {
        setDims(
          calcDims(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight),
        );
      }}
    />
  );
};

export default QuizOakImage;
