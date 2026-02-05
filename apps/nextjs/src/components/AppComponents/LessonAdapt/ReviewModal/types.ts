import type { AdaptationPlan } from "@oakai/lesson-adapters";

export interface Thumbnail {
  objectId: string;
  slideIndex: number;
  thumbnailUrl: string;
  width: number;
  height: number;
}

export interface SlideKlpMapping {
  slideNumber: number;
  slideId: string;
  keyLearningPoints: string[];
  learningCycles: string[];
  coversDiversity: boolean;
}

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: AdaptationPlan;
  presentationId: string;
  presentationUrl: string;
  thumbnails: Thumbnail[] | null;
  slideKlpMappings: SlideKlpMapping[];
  approvedChangeIds: string[];
  onToggleChange: (changeId: string) => void;
  onApproveAll: () => void;
  onRejectAll: () => void;
  onExecute: () => Promise<void>;
  isExecuting: boolean;
}

export type ReviewTab = "slides" | "changes" | "thumbnails";
