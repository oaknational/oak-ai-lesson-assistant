import type { StemImageObject } from "../rawQuiz";
import {
  constrainImageUrl,
  getConstrainedStemImageUrl,
} from "./cloudinaryImageHelper";

describe("constrainImageUrl", () => {
  it("adds size constraints to Cloudinary URL with version", () => {
    const input =
      "https://oaknationalacademy-res.cloudinary.com/image/upload/v1702545884/euy1sjtfakobqdfe4pyh.png";
    const result = constrainImageUrl(input);
    expect(result).toBe(
      "https://oaknationalacademy-res.cloudinary.com/image/upload/c_limit,h_1200,w_1200/v1702545884/euy1sjtfakobqdfe4pyh.png",
    );
  });

  it("leaves non-Cloudinary URLs unchanged", () => {
    const input = "https://example.com/image.png";
    expect(constrainImageUrl(input)).toBe(input);
  });

  it("does not modify URLs that already have constraints", () => {
    const input =
      "https://oaknationalacademy-res.cloudinary.com/image/upload/c_limit,h_1200,w_1200/v1702545884/euy1sjtfakobqdfe4pyh.png";
    expect(constrainImageUrl(input)).toBe(input);
  });
});

describe("getConstrainedStemImageUrl", () => {
  it("applies constraints to StemImageObject", () => {
    const imageStem: StemImageObject = {
      type: "image",
      image_object: {
        secure_url:
          "https://oaknationalacademy-res.cloudinary.com/image/upload/v1702545884/euy1sjtfakobqdfe4pyh.png",
        metadata: [],
      },
    };

    const result = getConstrainedStemImageUrl(imageStem);
    expect(result).toBe(
      "https://oaknationalacademy-res.cloudinary.com/image/upload/c_limit,h_1200,w_1200/v1702545884/euy1sjtfakobqdfe4pyh.png",
    );
  });
});
