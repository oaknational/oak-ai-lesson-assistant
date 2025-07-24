export const lessonOverviewQuery = `
query lessonOverview(
$lesson_slug: String!
$programme_slug: String!
$browseDataWhere: published_mv_synthetic_unitvariant_lessons_by_keystage_13_1_0_bool_exp
) {
  browseData: published_mv_synthetic_unitvariant_lessons_by_keystage_13_1_0(
    where: { programme_slug: { _eq: $programme_slug } }
  ) {
    lesson_slug
    unit_slug
    programme_slug
    programme_slug_by_year
    is_legacy
    lesson_data
    unit_data
    programme_fields
    actions
    features
    order_in_unit
  }
  content: published_mv_lesson_content_published_5_0_0(
    where: { lesson_slug: { _eq: $lesson_slug } }
  ) {
    lesson_id
    lesson_title
    lesson_slug
    is_legacy
    misconceptions_and_common_mistakes
    equipment_and_resources
    teacher_tips
    key_learning_points
    pupil_lesson_outcome
    lesson_keywords
    content_guidance
    transcript_sentences
    starter_quiz
    exit_quiz
 
  }
}
`;

export const lessonsWithRestrictedContentQuery = `
query lessonsWithRestrictedContent {
  content: published_mv_lesson_content_published_5_0_0(
    where: { 
      content_guidance: {
        _is_null: false
      }
      is_legacy: { _eq: false }
    }
  ) {
    lesson_id
    lesson_title
    lesson_slug
    is_legacy
    content_guidance
  }
}
`;

export const lessonsWithSpecificRestrictedContentQuery = `
query lessonsWithSpecificRestrictedContent {
  content: published_mv_lesson_content_published_5_0_0(
    where: { 
      content_guidance: {
        _some: {
          contentguidance_label: {
            _in: [
              "Depiction or discussion of discriminatory behaviour",
              "Depiction or discussion of sensitive content",
              "Depiction or discussion of sexual violence",
              "Depiction or discussion of sexual content",
              "Depiction or discussion of mental health issues",
              "Depiction or discussion of serious crime"
            ]
          }
        }
      }
    }
  ) {
    lesson_id
    lesson_title
    lesson_slug
    is_legacy
    misconceptions_and_common_mistakes
    equipment_and_resources
    teacher_tips
    key_learning_points
    pupil_lesson_outcome
    lesson_keywords
    content_guidance
    transcript_sentences
    starter_quiz
    exit_quiz
  }
}
`;
