export const lessonOverviewQuery = `
query lessonOverview($lesson_slug: String!) {
  lessons: published_mv_lesson_content_published_5_0_0(
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
    supervision_level
    video_title
    has_worksheet_google_drive_downloadable_version
    has_slide_deck_asset_object
    worksheet_asset_id
    has_worksheet_asset_object
    worksheet_answers_asset_id
    has_worksheet_answers_asset_object
    supplementary_asset_id
    has_supplementary_asset_object
    slide_deck_asset_id
    slide_deck_asset_object_url
    worksheet_asset_object_url
    supplementary_asset_object_url
    has_lesson_guide_google_drive_downloadable_version
    lesson_guide_asset_object_url
    has_lesson_guide_object
    lesson_guide_asset_id
  }
}
`;
