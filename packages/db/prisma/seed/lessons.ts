/*
 * This script is no longer in use or maintained hence has been removed.
 * If you would like to find the original script go to an old commit.
 * The new process is the importLessons script which can be found in core pakcage.json
 *
 */

export async function processGraphQLLesson() {
  return null;
}

/**
 * Fetch lesson data from oak's graphql API
 * This is a temporary workaround to get the VTT files. We do a load of
 * post-processing on the data to try and match the data that makes it to
 * the front-end of teacher-hub. Ideally we can deprecate this when we
 * start mirroring the 2023 database structure
 */
export async function seedLessons() {
  return null;
}

/**
 * 1. Fetch a batch of LESSON_QUERY_BATCH_SIZE lessons
 * 2. "Hydrate" the lessons (map nested values to top level)
 * 3. Parse them with zod
 * 4. Fetch their corresponding caption data
 * 5. Assign the captions back to the matching lessons
 */
export async function getLessonBatch() {
  return null;
}

// seedLessons();
export default seedLessons;
