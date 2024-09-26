import { gql } from "graphql-request";

export const query = gql`
  query OakLesons {
    published_mv_lesson_openapi_1_1_0(limit: 10, distinct_on: lessonSlug) {
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
