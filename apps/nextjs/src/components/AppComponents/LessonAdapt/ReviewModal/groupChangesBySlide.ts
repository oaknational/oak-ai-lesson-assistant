import type {
  AdaptationPlan,
  SlideContent,
  SlidesAgentResponse,
  TableCellEdit,
  TextEdit,
} from "@oakai/lesson-adapters";

import { SLIDE_TYPE_SUMMARIES, formatSlideType } from "../AdaptSlideCard";
import type { Thumbnail } from "./types";

type SlideDeletion = SlidesAgentResponse["changes"]["slideDeletions"][number];
type TextElementDeletion =
  SlidesAgentResponse["changes"]["textElementDeletions"][number];

export type SlideReviewData = {
  slideNumber: number;
  title: string;
  typeLabel: string;
  description: string;
  klps: string[];
  thumbnailUrl: string | undefined;
  textEdits: TextEdit[];
  tableEdits: TableCellEdit[];
  textDeletions: TextElementDeletion[];
  slideDeletion: SlideDeletion | null;
  keepReasoning: string | undefined;
  hasChanges: boolean;
};

function getSlideTypeAndDescription(slideType: string): {
  typeLabel: string;
  description: string;
} {
  const summary = SLIDE_TYPE_SUMMARIES[slideType] ?? "";
  const colonIndex = summary.indexOf(": ");
  if (colonIndex === -1) {
    return { typeLabel: formatSlideType(slideType), description: summary };
  }
  return {
    typeLabel: summary.substring(0, colonIndex),
    description: summary.substring(colonIndex + 2),
  };
}

export function groupChangesBySlide(
  plan: AdaptationPlan,
  slides: SlideContent[],
  thumbnails: Thumbnail[] | null,
): SlideReviewData[] {
  const { changes } = plan.slidesAgentResponse;

  const allSlideNumbers = [
    ...new Set([
      ...slides.map((s) => s.slideNumber),
      ...(thumbnails ?? []).map((t) => t.slideIndex + 1),
    ]),
  ].sort((a, b) => a - b);

  return allSlideNumbers.map((slideNumber) => {
    const slide = slides.find((s) => s.slideNumber === slideNumber);
    const thumbnail = thumbnails?.find((t) => t.slideIndex + 1 === slideNumber);
    const slideType = slide?.slideType ?? "";

    const textEdits = changes.textEdits.filter(
      (e) => e.slideNumber === slideNumber,
    );
    const tableEdits = changes.tableCellEdits.filter(
      (e) => e.slideNumber === slideNumber,
    );
    const textDeletions = changes.textElementDeletions.filter(
      (e) => e.slideNumber === slideNumber,
    );
    const slideDeletion =
      changes.slideDeletions.find((d) => d.slideNumber === slideNumber) ?? null;
    const slideToKeep =
      changes.slidesToKeep.find((k) => k.slideNumber === slideNumber) ?? null;

    const hasChanges =
      textEdits.length > 0 ||
      tableEdits.length > 0 ||
      textDeletions.length > 0 ||
      slideDeletion !== null;

    const { typeLabel, description } = getSlideTypeAndDescription(slideType);

    return {
      slideNumber,
      title: `${slideNumber}. ${formatSlideType(slideType || "Slide")} ${slide?.learningCycles?.length ? `- ${slide.learningCycles.join(", ")}` : ""}`,
      typeLabel,
      description,
      klps: slide?.keyLearningPoints ?? [],
      thumbnailUrl: thumbnail?.thumbnailUrl,
      textEdits,
      tableEdits,
      textDeletions,
      slideDeletion,
      keepReasoning: slideToKeep?.reasoning,
      hasChanges,
    };
  });
}
