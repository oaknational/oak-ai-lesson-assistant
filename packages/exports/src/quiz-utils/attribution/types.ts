import type { QuizV2Question } from "../../schema/input.schema";

export type { QuizV2Question };

export interface ImageWithAttribution {
  questionNumber: number;
  imageIndex: number; // 1-based: 1st, 2nd image in question
  imageUrl: string;
  attribution: string;
  altText?: string;
}

export interface ExtractedImage {
  url: string;
  index: number; // 1-based position within question
  altText: string;
}

export interface AttributionSegment {
  text: string;
  bold: boolean;
}

export interface FormattedAttribution {
  plainText: string;
  segments: AttributionSegment[];
}

export interface ImageAttribution {
  imageUrl: string;
  attribution: string;
}
