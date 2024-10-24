import { gql } from "graphql-request";

export const query = gql`
  query OakLessons($limit: Int!, $offset: Int!) {
    lessons: published_mv_lesson_openapi_1_1_0(
      limit: $limit
      offset: $offset
      distinct_on: lessonSlug
      where: { videoTitle: { _is_null: false }, isLegacy: { _eq: false } }
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
