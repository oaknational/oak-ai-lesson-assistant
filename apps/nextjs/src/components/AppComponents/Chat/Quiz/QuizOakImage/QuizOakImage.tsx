import type { Dispatch, FC, SetStateAction } from "react";

import { OakImage } from "@oaknational/oak-components";

import type { StemImageObject } from "../quizTypes";
import { calcDims } from "../quizUtils";

type QuizOakImageProps = {
  src: StemImageObject["imageObject"];
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
      src={src.secureUrl}
      alt={alt ?? ""}
      style={{ objectFit: "contain" }}
    />
  ) : (
    <OakImage
      // $objectPosition={["center", "left"]}
      fill
      src={src.secureUrl}
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
