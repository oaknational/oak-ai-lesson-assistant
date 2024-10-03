import {
  CompletedLessonPlanSchema,
  LessonPlanJsonSchema,
  LooseLessonPlan,
} from "@oakai/aila/src/protocol/schema";
import { template } from "@oakai/core/src/prompts/lesson-assistant";
import { zodResponseFormat } from "openai/helpers/zod";

import { Captions, RawLesson } from "../zod-schema/zodSchema";

export function getLessonPlanBatchFileLine({
  lessonId,
  rawLesson,
  captions,
}: {
  lessonId: string;
  rawLesson: RawLesson;
  captions: Captions;
}) {
  const { lessonTitle, keyStageSlug, subjectSlug } = rawLesson;
  const lessonPlan: LooseLessonPlan = {
    title: lessonTitle,
    keyStage: keyStageSlug,
    subject: subjectSlug,
  };

  for (const [key, value] of Object.entries(lessonPlan)) {
    if (!value) {
      throw new Error(`Missing ${key} for lesson ${lessonId}`);
    }
  }

  const compiledTemplate = template({
    lessonPlan,
    relevantLessonPlans: "None",
    summaries: "None",
    responseMode: "generate",
    lessonPlanJsonSchema: JSON.stringify(LessonPlanJsonSchema),
    llmResponseJsonSchema: "",
    isUsingStructuredOutput: true,
  });

  const systemPrompt = compiledTemplate;

  const captionText = captions.map((c) => c.text).join(" ");

  const userPrompt = `I would like to generate a lesson plan for a lesson titled "${lessonTitle}" in ${subjectSlug} at ${keyStageSlug}.
The lesson has the following transcript which is a recording of the lesson being delivered by a teacher.
I would like you to base your response on the content of the lesson rather than imagining other content that could be valid for a lesson with this title.
Think about the structure of the lesson based on the transcript and see if it can be broken up into logical sections which correspond to the definition of a learning cycle.
The transcript may include introductory and exit quizzes, so include these if they are multiple choice. Otherwise generate the multiple choice quiz questions based on the content of the rawLesson.
The transcript is as follows:

LESSON TRANSCRIPT STARTS
${captionText}
LESSON TRANSCRIPT ENDS`;

  const batchRequest = {
    custom_id: lessonId,
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(
        CompletedLessonPlanSchema,
        "lesson_plan",
      ),
    },
  };

  return batchRequest;
}
