export const tcpWorksByLessonSlug = `
query tcpWorksByLessonSlug($lesson_slug: String!) {
  tcpWorksByLessonSlug: published_mv_get_tpc_works_by_lesson_slug_1_0_0(where: { 
    slug: {_eq: $lesson_slug}
  }) {
    slug
    lesson_id
    works_list
  }
}`;

export const tcpWorks = `
query tcpWorksByLessonSlug {
  tcpWorks: published_mv_get_tpc_works_by_lesson_slug_1_0_0
   {
    slug
    lesson_id
    works_list
  }
}`;
