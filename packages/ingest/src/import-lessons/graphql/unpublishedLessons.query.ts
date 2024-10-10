import { gql } from "graphql-request";

export const unpublishedLessonsQuery = gql`
  query UnpublishedLessons($limit: Int! = 1, $offset: Int! = 0) {
    published_mv_synthetic_unitvariant_lessons_by_keystage_6_1_0(
      limit: $limit
      offset: $offset
      where: { is_legacy: { _eq: false } }
    ) {
      lessonSlug: lesson_data(path: "slug")
      lessonTitle: lesson_data(path: "title")
      lessonId: lesson_data(path: "lesson_id")
      subjectSlug: programme_fields(path: "subject_slug")
      keystageSlug: programme_fields(path: "keystage_slug")
    }
  }
`;
