import { gql } from "graphql-request";

export type QueryWhere = {
  videoTitle?: {
    _is_null?: boolean;
  };
  isLegacy?: {
    _is_null?: boolean;
  };
  lessonSlug?: {
    _eq?: string;
  };
};
export type QueryVariables = {
  limit: number;
  offset: number;
  where: QueryWhere;
};
export const query = gql`
  query OakLessons(
    $limit: Int!
    $offset: Int!
    $where: published_mv_lesson_openapi_1_1_0_bool_exp!
  ) {
    lessons: published_mv_lesson_openapi_1_1_0(
      limit: $limit
      offset: $offset
      distinct_on: lessonSlug
      where: $where
    ) {
      oakLessonId: lessonId
      lessonSlug
      lessonTitle
      programmeSlug
      unitSlug
      unitTitle
      keyStageSlug
      keyStageTitle
      subjectSlug
      subjectTitle
      examBoardTitle
      tierTitle
      misconceptionsAndCommonMistakes
      lessonEquipmentAndResources
      teacherTips
      keyLearningPoints
      pupilLessonOutcome
      lessonKeywords
      copyrightContent
      contentGuidance
      additionalMaterialUrl
      supervisionLevel
      worksheetUrl
      presentationUrl
      transcriptSentences
      starterQuiz
      exitQuiz
      yearTitle
      hasDownloadableResources
      videoTitle
    }
  }
`;
