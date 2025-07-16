// export const copyrightLesson = `
// query complexCopyrightLessons($lesson_slug: String!) {
//   lessons(where: {slug: {_eq: $lesson_slug} _state: {_eq: "published"}}) {
//     slug
//     features
//     _state
//   }
// }`;

export const copyrightLesson = `
query complexCopyrightLessons {
  lessons(where: { 
    _state: {_eq: "published"}
    features: {_is_null: false, _neq: {}}
  }) {
    slug
    features
    _state
    copyright_content
  }
}`;

export const tcpMediaByLessonSlug = `
query tcpMediaByLessonSlug($lesson_slug: String!) {
  published_mv_get_tpc_media_by_lesson_slug_1_0_0(where: { 
    slug: {_eq: $lesson_slug}
  }) {
    slug
    lesson_id
    media_list
  }
}`;
