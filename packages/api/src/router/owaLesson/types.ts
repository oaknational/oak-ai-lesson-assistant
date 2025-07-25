import { type SyntheticUnitvariantLessonsByKs } from "@oaknational/oak-curriculum-schema";

export type LessonContentSchema = {
  lesson_slug: string;
  title: string;
  content_guidance?: string[];
  transcript_sentences?: string[];
  [key: string]: any;
};

export type LessonOverviewResponse = {
  data?: {
    content?: LessonContentSchema[];
    browseData?: SyntheticUnitvariantLessonsByKs[];
  };
};

export type TRPCWorksResponse = {
  data?: {
    tcpWorksByLessonSlug?: {
      slug: string;
      lesson_id: number;
      works_list: {
        title: string;
        author?: string;
        works_id: number;
        works_uid: string;
        attribution?: string;
        restriction_level: string;
        tpc_contracts_list: number[];
        [key: string]: any;
      }[];
    }[];
  };
};