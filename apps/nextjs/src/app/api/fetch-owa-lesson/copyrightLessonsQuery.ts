export const copyrightLessons = `
query lessonOverview {
  browseData: published_mv_synthetic_unitvariant_lessons_by_keystage_13_1_0

 {
    lesson_slug
    unit_slug
    programme_slug
    programme_slug_by_year
    is_legacy
    programme_fields
    features

  }
}

`;
