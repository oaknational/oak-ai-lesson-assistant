import fs from "node:fs";
import { zodResponseFormat } from "openai/helpers/zod";

import { Captions, RawLesson } from "../zod-schema/zodSchema";

export function getLessonPlanBatchFileLine({
  rawLesson,
  captions,
}: {
  rawLesson: RawLesson;
  captions: Captions;
}) {
  const lessonPlan = {
    title: lesson.lessonTitle,
  };

  for (const [key, value] of Object.entries(lessonPlan)) {
    if (!value) {
      throw new Error(`Missing ${key} for lesson ${lesson.id}`);
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

  let validCaptions: (Caption & { text?: string })[] = [];
  try {
    validCaptions = JSON.parse(lesson.captions);
  } catch (error) {
    console.log(lesson.captions);
    console.error("Failed to JSON parse captions", error);
  }
  try {
    validCaptions = validCaptions.map((c) => ({
      start: c.start,
      end: c.end,
      part: c.part ?? c.text,
    }));
    validCaptions = CaptionsSchema.parse(validCaptions);
  } catch (err) {
    fs.writeFileSync(
      `${__dirname}/invalid_captions_error.json`,
      JSON.stringify(err),
    );
    fs.writeFileSync(`${__dirname}/invalid_captions.json`, lesson.captions);
    throw new Error("Failed to parse captions");
  }

  const captionText = validCaptions.map((c) => c.part).join(" ");

  const keyStageTitle = keyStage?.title ?? "an unknown key stage";
  const subjectTitle = subject?.title ?? "an unknown subject";

  const summaryOverview = summary
    ? `We have summarised the lesson to explain what it is about and its content. This may be helpful for you to generate the lesson plan.

LESSON SUMMARY STARTS
${summary.content}
LESSON SUMMARY ENDS

TOPICS
${summary.topics.join(",")}.

LEARNING OBJECTIVES
${summary.learningObjectives.join(". ")}.

CONCEPTS
${summary.concepts.join(",")}.

KEYWORDS
${summary.keywords.join(",")}.`
    : "There is no summary for this lesson";

  const userPrompt = `I would like to generate a lesson plan for a lesson titled "${lesson.title}" in ${subjectTitle} at ${keyStageTitle}.
The lesson has the following transcript which is a recording of the lesson being delivered by a teacher.
I would like you to base your response on the content of the lesson rather than imagining other content that could be valid for a lesson with this title.
Think about the structure of the lesson based on the transcript and see if it can be broken up into logical sections which correspond to the definition of a learning cycle.
The transcript may include introductory and exit quizzes, so include these if they are multiple choice. Otherwise generate the multiple choice quiz questions based on the content of the lesson.
The transcript is as follows:

LESSON TRANSCRIPT STARTS
${captionText}
LESSON TRANSCRIPT ENDS

The lesson may also have a summary that has been generated to summarise what the lesson is about.

${summaryOverview}`;

  const batchRequest = {
    custom_id: lesson.id,
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
