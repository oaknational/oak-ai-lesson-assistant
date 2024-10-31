import type { Captions } from "../../zod-schema/zodSchema";

export const transcriptPromptPart = (
  captions: Captions,
) => `The lesson has the following transcript which is a recording of the lesson being delivered by a teacher.
I would like you to base your response on the content of the lesson rather than imagining other content that could be valid for a lesson with this title.
Think about the structure of the lesson based on the transcript and see if it can be broken up into logical sections which correspond to the definition of a learning cycle.
The transcript may include introductory and exit quizzes, so include these if they are multiple choice. Otherwise generate the multiple choice quiz questions based on the content of the rawLesson.
The transcript is as follows:

<lesson-transcript>
${captions.map((c) => c.text).join(" ")}
</lesson-transcript>`;
