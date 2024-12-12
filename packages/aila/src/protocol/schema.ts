import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const BasedOnSchema = z
  .object({
    id: z
      .string()
      .describe(
        "The database ID of an existing lesson plan that this lesson plan is based upon. It should be the ID of the lesson plan that was used to inform the content of this lesson plan. It should not be the number that the user has selected when choosing which lesson on which to base their new lesson.",
      ),
    title: z.string().describe("The human-readable title of the lesson."),
  })
  .describe(
    "A reference to a lesson plan that this lesson is based on. This value should only be set if the user has explicitly chosen to base their lesson on an existing lesson plan by selecting one from a selection of options, otherwise this should be blank.",
  );

export const BasedOnOptionalSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
});

export type BasedOn = z.infer<typeof BasedOnSchema>;
export type BasedOnOptional = z.infer<typeof BasedOnOptionalSchema>;

export const MisconceptionSchema = z.object({
  misconception: z
    .string()
    .describe(
      "a single sentence describing a common misconception about the topic. Do not end with a full stop.",
    ),
  description: z
    .string()
    .max(250)
    .describe(
      "No more than 2 sentences addressing the reason for the misconception and how it can be addressed in the lesson.",
    ),
  definition: z
    .string()
    .optional()
    .describe("Not to be used. Only included here for legacy support."), // There is some confusion here about what the LLM generates
});

// When using Structured Outputs we cannot specify the length of arrays or strings
export const MisconceptionSchemaWithoutLength = z.object({
  misconception: z
    .string()
    .describe(
      "a single sentence describing a common misconception about the topic. Do not end with a full stop.",
    ),
  description: z
    .string()
    .describe(
      "No more than 2 sentences addressing the reason for the misconception and how it can be addressed in the lesson. Maximum 250 characters in length.",
    ),
});

export const MisconceptionOptionalSchema = z.object({
  misconception: z.string().optional(),
  description: z.string().optional(),
  definition: z.string().optional(), // There is some confusion here about what the LLM generates
});

export const MisconceptionsSchema = z
  .array(MisconceptionSchema)
  .min(1)
  .max(3)
  .describe(
    "An array of misconceptions which a student might have about the topic covered in the lesson.",
  );

// When using Structured Outputs we cannot specify the length of arrays or strings
export const MisconceptionsSchemaWithoutLength = z
  .array(MisconceptionSchemaWithoutLength)
  .describe(
    "An array of misconceptions which a student might have about the topic covered in the lesson. Minimum 1, maximum 3 items.",
  );
export const MisconceptionsOptionalSchema = z.array(
  MisconceptionOptionalSchema,
);

export type Misconception = z.infer<typeof MisconceptionSchema>;
export type MisconceptionOptional = z.infer<typeof MisconceptionOptionalSchema>;
export type MisconceptionsOptional = z.infer<
  typeof MisconceptionsOptionalSchema
>;

export const QuizQuestionOptionalSchema = z.object({
  question: z.string().optional(),
  answers: z.array(z.string()).optional(),
  distractors: z.array(z.string()).optional(),
});

// export const QuizQuestionSchema = z.object({
//   question: z.string().describe("The question to be asked in the quiz."),
//   answers: z.array(z.string()).describe("The correct answer."),
//   distractors: z.array(z.string()).describe("A set of distractors."),
// });

// TODO: GCLOMAX: Relax this constraint to allow for more than one answer.
// Needs to be changed - to adapt for LLM handling.
// Added hint and feedback to the schema.

export const QuizQuestionSchema = z.object({
  question: z.string().describe("The question to be asked in the quiz."),
  answers: z.array(z.string()).describe("The correct answer."),
  distractors: z.array(z.string()).describe("A set of distractors."),
  // hint: z
  //   .string()
  //   .optional()
  //   .describe("A hint to help the student answer the question."),
  // feedback: z
  //   .string()
  //   .optional()
  //   .describe("Feedback to be given to the student."),
  // html: z
  //   .array(z.string())
  //   .optional()
  //   .describe(
  //     "HTML content for the question for use when rendering a different question. DO NOT GENERATE THIS FIELD WHEN PASSED TO AN LLM",
  //   ),
});

// When using Structured Outputs we cannot specify the length of arrays or strings
export const QuizQuestionSchemaWithoutLength = z.object({
  question: z.string().describe("The question to be asked in the quiz."),
  answers: z
    .array(z.string())
    .describe("The correct answer. This should be an array of only one item."),
  distractors: z
    .array(z.string())
    .describe("A set of distractors. This must be an array with two items."),
});

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizQuestionOptional = z.infer<typeof QuizQuestionOptionalSchema>;

export const QuizSchema = z.array(QuizQuestionSchema);
export const QuizSchemaWithoutLength = z.array(QuizQuestionSchemaWithoutLength);
export const QuizOptionalSchema = z.array(QuizQuestionOptionalSchema);

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizOptional = z.infer<typeof QuizOptionalSchema>;

export const ExplanationSchema = z
  .object({
    spokenExplanation: z.union([z.string(), z.array(z.string())]).describe(
      `The spoken teacher explanation in the EXPERT_TEACHER voice. About five or six sentences or 5-12 markdown list items. In the spoken explanation, give guidance to the teacher on which key points should be covered in their explanation to students. This should be teacher facing and not include a script or narrative for the teacher.

Should bear in mind the following requirements:
- teacher facing 
- outline the key points that the teacher should address during their explanation 
- include as much detail as possible
- written in bullet points  
- break concepts into small, manageable chunks
- if appropriate, the method for explanation should be included for e.g. demonstrate to pupils how to set up the apparatus for the experiment or model how to complete the pass for students or use a bar model to show the addition of these three numbers.
- abstract concepts are made concrete
- the explanation should be clear
- images will be used to support dual coding for pupils
- this is not a script!`,
    ),
    accompanyingSlideDetails: z
      .string()
      .describe(
        "A description of the image or video to be used. Should describe what should be displayed on the slides for pupils to look at during the explanation. This is to enable dual coding of a visual image and the teachers explanation being given verbally. Written in the EXPERT_TEACHER voice.",
      ),
    imagePrompt: z
      .string()
      .describe(
        "A prompt to generate an image, or a search term to use to find an image or video. Should tell the teacher what images to search for to display on the slides. Written in the EXPERT_TEACHER voice.",
      ),
    slideText: z
      .string()
      .describe(
        "The slide text would appear on the slide when the teacher delivers this part of the lesson. It should be a short, succinct summary of the content in the explanation. It should be no longer than 2 sentences. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
      ),
  })
  .describe(
    "The TEACHER EXPLANATION, obeying the learning cycle rules for this part of the lesson.",
  );

export const ExplanationOptionalSchema = z.object({
  spokenExplanation: z.union([z.string(), z.array(z.string())]).optional(), // (about five or six sentences or 5-12 markdown list items)
  accompanyingSlideDetails: z.string().optional(), // (a description of the image or video to be used)
  imagePrompt: z.string().optional(), // (a prompt to generate an image, or a search term to use to find an image or video),
  slideText: z.string().optional(), // The text that would appear on the slide when the teacher delivers this part of the lesson
});

export type Explanation = z.infer<typeof ExplanationSchema>;
export type ExplanationOptional = z.infer<typeof ExplanationOptionalSchema>;

export const CheckForUnderstandingSchema = z.object({
  question: z
    .string()
    .describe(
      "A multiple choice question to ask as a check to see if the students have understood the content of this cycle. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  answers: z
    .array(z.string())
    .length(1)
    .describe(
      "The correct answer to the question. If this is of length ANSWER_LENGTH, then all distractor strings should be very close in length to ANSWER_LENGTH.",
    ),
  distractors: z
    .array(z.string())
    .min(2)
    .describe(
      "Two incorrect distractors which could be the answer to the question but are not correct. These strings should be of similar length to ANSWER_LENGTH so that the correct answer does not stand out because it is obviously longer than the distractors.",
    ),
});

// When using Structured Outputs we cannot specify the length of arrays or strings
export const CheckForUnderstandingSchemaWithoutLength = z.object({
  question: z
    .string()
    .describe(
      "A multiple choice question to ask as a check to see if the students have understood the content of this cycle. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  answers: z
    .array(z.string())
    .describe(
      "The correct answer to the question. If this is of length ANSWER_LENGTH, then all distractor strings should be very close in length to ANSWER_LENGTH.",
    ),
  distractors: z
    .array(z.string())
    .describe(
      "Two incorrect distractors which could be the answer to the question but are not correct. These strings should be of similar length to ANSWER_LENGTH so that the correct answer does not stand out because it is obviously longer than the distractors.",
    ),
});

export const CheckForUnderstandingOptionalSchema = z.object({
  question: z.string().optional(),
  answers: z.array(z.string()).optional(),
  distractors: z.array(z.string()).optional(),
});

export const CycleSchema = z.object({
  title: z.string().describe("The title of the learning cycle"),
  durationInMinutes: z
    .number()
    .describe(
      "An estimated duration for how long it would take the teacher to deliver this part of the lesson.",
    ),
  explanation: ExplanationSchema.describe(
    "An object describing how the teacher would explain the content of this cycle to the students. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  ),
  checkForUnderstanding: z
    .array(CheckForUnderstandingSchema)
    .min(2)
    .describe(
      "Two or more questions to check that students have understood the content of this cycle. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  practice: z
    .string()
    .describe(
      "The activity that the pupils are asked to do to practice what they have learnt. Should be pupil facing and include all details that the pupils need to complete the task. Should be linked to the learning cycle command word and should enable pupils to practice the key learning points that have been taught during this learning cycle. Should include calculations if this is appropriate. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  feedback: z
    .string()
    .describe(
      "Student-facing feedback which will be presented on a slide, giving the correct answer to the practice task. This should adhere to the rules as specified in the LEARNING CYCLES: FEEDBACK section of the lesson plan guidance. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
});

// When using Structured Outputs we cannot specify the length of arrays or strings
export const CycleSchemaWithoutLength = z.object({
  title: z
    .string()
    .describe(
      "The title of the learning cycle written in sentence case starting with a capital letter and not ending with a full stop.",
    ),
  durationInMinutes: z
    .number()
    .describe(
      "An estimated duration for how long it would take the teacher to deliver this part of the lesson.",
    ),
  explanation: ExplanationSchema.describe(
    "An object describing how the teacher would explain the content of this cycle to the students. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  ),
  checkForUnderstanding: z
    .array(CheckForUnderstandingSchemaWithoutLength)
    .describe(
      "Two or more questions to check that students have understood the content of this cycle. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  practice: z
    .string()
    .describe(
      "The activity that the pupils are asked to do to practice what they have learnt. Should be pupil facing and include all details that the pupils need to complete the task. Should be linked to the learning cycle command word and should enable pupils to practice the key learning points that have been taught during this learning cycle. Should include calculations if this is appropriate. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
  feedback: z
    .string()
    .describe(
      "Student-facing feedback which will be presented on a slide, giving the correct answer to the practice task. This should adhere to the rules as specified in the LEARNING CYCLES: FEEDBACK section of the lesson plan guidance. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
    ),
});

export const CycleOptionalSchema = z.object({
  title: z.string().optional(),
  durationInMinutes: z.number().optional(),
  explanation: ExplanationOptionalSchema.optional(),
  checkForUnderstanding: z
    .array(CheckForUnderstandingOptionalSchema)
    .optional(),
  practice: z.string().optional(),
  feedback: z.string().optional(),
});

export type CycleOptional = z.infer<typeof CycleOptionalSchema>;
export type Cycle = z.infer<typeof CycleSchema>;

// "keyword" and "definition", where keyword is a word to be included throughout the lesson, and "definition" gives a short definition of the keyword including the keyword itself. Provide no more than 5 total keywords. Each keyword should be a maximum of 30 characters long. Each definition should be a maximum of 200 characters long.
export const KeywordSchema = z
  .object({
    keyword: z
      .string()
      .max(30)
      .describe(
        "The keyword itself. Should be in sentence case starting with a capital letter and not end with a full stop.",
      ),
    definition: z
      .string()
      .max(200)
      .describe(
        "A short definition of the keyword including the keyword itself. Should be in sentence case starting with a capital letter and not end with a full stop. Written in TEACHER_TO_PUPIL_SLIDES voice.",
      ),
    description: z
      .string()
      .optional()
      .describe("Not to be used, and included here only for legacy purposes."), // There is some confusion here about what the LLM generates
  })
  .describe(
    "A keyword that is used in the lesson. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  );

// When using Structured Outputs we cannot specify the length of arrays or strings
export const KeywordSchemaWithoutLength = z
  .object({
    keyword: z
      .string()
      .describe(
        "The keyword itself. Should be in sentence case starting with a capital letter and not end with a full stop. Maximum 30 characters long.",
      ),
    definition: z
      .string()
      .describe(
        "A short definition of the keyword including the keyword itself. Should be in sentence case starting with a capital letter and not end with a full stop. Written in TEACHER_TO_PUPIL_SLIDES voice. Maximum 200 characters long.",
      ),
  })
  .describe(
    "A keyword that is used in the lesson. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  );

export const KeywordOptionalSchema = z.object({
  keyword: z.string().optional(),
  definition: z.string().optional(),
  description: z.string().optional(), // There is some confusion here about what the LLM generates
});

export const KeywordsSchema = z
  .array(KeywordSchema)
  .min(1)
  .max(5)
  .describe(
    "A set of keywords where each is a word to be included throughout the lesson.",
  );

// When using Structured Outputs we cannot specify the length of arrays or strings
export const KeywordsSchemaWithoutLength = z
  .array(KeywordSchemaWithoutLength)
  .describe(
    "A set of keywords where each is a word to be included throughout the lesson. Minimum 1 keyword, maximum 5.",
  );
export const KeywordsOptionalSchema = z.array(KeywordOptionalSchema);

export type KeywordOptional = z.infer<typeof KeywordOptionalSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;

function minMaxText({
  min,
  max,
  entity = "elements",
}: {
  min?: number;
  max?: number;
  entity?: "elements" | "characters";
}) {
  if (typeof min !== "number" && typeof max !== "number") {
    throw new Error("min or max must be provided");
  }
  if (typeof min === "number" && typeof max === "number") {
    return `Minimum ${min}, maximum ${max} ${entity}`;
  }
  if (typeof min === "number") {
    return `Minimum ${min} ${entity}`;
  }
  return `Maximum ${max} ${entity}`;
}

export const CompletedLessonPlanSchema = z.object({
  title: z.string().describe(
    `The title of the lesson. Lesson titles should be a unique and succinct statement, not a question. Can include special characters if appropriate but should not use & sign instead of 'and'. Written in the TEACHER_TO_PUPIL_SLIDES voice. The title should be in sentence case starting with a capital letter and not end with a full stop. ${minMaxText(
      {
        max: 80,
        entity: "characters",
      },
    )}`,
  ),
  keyStage: z
    .union([
      z.enum([
        "key-stage-1",
        "key-stage-2",
        "key-stage-3",
        "key-stage-4",
        "key-stage-5",
        "early-years-foundation-stage",
        "specialist",
        "further-education",
        "higher-education",
      ]),
      z.string(),
    ])
    .describe(
      "The lesson's Key Stage as defined by UK educational standards. In slug format (kebab-case).",
    ),
  subject: z
    .string()
    .describe(
      "The subject that this lesson is included within, for instance English or Geography.",
    ),

  topic: z
    .string()
    .describe(
      "A topic that this lesson would sit within, which might cover several lessons with a shared theme.",
    ),
  learningOutcome: z.string().describe(
    `What the pupils will have learnt by the end of the lesson. Should start with 'I can' and outline what pupils should be able to know/and or be able to do by the end of the lesson. Written in age appropriate language. May include a command word. Written in the PUPIL voice. ${minMaxText(
      {
        max: 190,
        entity: "characters",
      },
    )}`,
  ),
  learningCycles: z
    .array(z.string().describe(minMaxText({ max: 120, entity: "characters" })))
    .describe(
      `An array of learning cycle outcomes. Should include a command word. Should be succinct. Should outline what pupils should be able to do/understand/know by the end of the learning cycle. Written in the TEACHER_TO_PUPIL_SLIDES voice. ${minMaxText(
        {
          min: 1,
          max: 3,
          entity: "elements",
        },
      )}`,
    ),
  priorKnowledge: z
    .array(z.string().describe(minMaxText({ max: 190, entity: "characters" })))
    .describe(
      `An array of prior knowledge statements, each being a succinct sentence. Written in the EXPERT_TEACHER voice. ${minMaxText(
        {
          min: 1,
          max: 5,
          entity: "elements",
        },
      )}`,
    ),
  keyLearningPoints: z
    .array(
      z.string().describe(
        `The misconception itself, in a single sentence, not ending with a full stop. Written in the EXPERT_TEACHER voice. ${minMaxText(
          {
            max: 120,
            entity: "characters",
          },
        )}`,
      ),
    )
    .describe(
      `An array of learning points, each being a succinct sentence. ${minMaxText(
        {
          min: 3,
          max: 5,
          entity: "elements",
        },
      )}`,
    ),
  misconceptions: MisconceptionsSchemaWithoutLength.describe(
    "A set of potential misconceptions which students might have about the content that is delivered in the lesson. Written in the EXPERT_TEACHER voice.",
  ),
  keywords: KeywordsSchemaWithoutLength.describe(
    "The keywords that are used in the lesson. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  ),
  basedOn: BasedOnSchema.optional(),
  starterQuiz: QuizSchemaWithoutLength.describe(
    "The starter quiz for the lesson, which tests prior knowledge only, ignoring the content that is delivered in the lesson. Obey the rules as specified in the STARTER QUIZ section of the lesson plan guidance. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  ),
  cycle1: CycleSchemaWithoutLength.describe("The first learning cycle"),
  cycle2: CycleSchemaWithoutLength.describe("The second learning cycle"),
  cycle3: CycleSchemaWithoutLength.describe("The third learning cycle"),
  exitQuiz: QuizSchemaWithoutLength.describe(
    "The exit quiz for the lesson, which tests the content that is delivered in the lesson. Written in the TEACHER_TO_PUPIL_SLIDES voice.",
  ),
  additionalMaterials: z
    .string()
    .optional()
    .describe(
      "Any additional materials or notes that are required or useful for the lesson",
    ),
});

export type CompletedLessonPlan = z.infer<typeof CompletedLessonPlanSchema>;

export const LessonPlanSchema = z.object({
  title: z.string().optional(),
  subject: z.string().optional(),
  keyStage: z.string().optional(),
  topic: z.string().optional(),
  learningOutcome: z.string().optional(),
  learningCycles: z.array(z.string()).optional(),
  priorKnowledge: z.array(z.string()).optional(),
  keyLearningPoints: z.array(z.string()).optional(),
  misconceptions: MisconceptionsOptionalSchema.optional(),
  keywords: KeywordsOptionalSchema.optional(),
  basedOn: BasedOnOptionalSchema.optional(),
  starterQuiz: QuizOptionalSchema.optional(),
  cycle1: CycleOptionalSchema.optional(),
  cycle2: CycleOptionalSchema.optional(),
  cycle3: CycleOptionalSchema.optional(),
  exitQuiz: QuizOptionalSchema.optional(),
  additionalMaterials: z.string().optional(),
  _experimental_starterQuizMathsV0: QuizOptionalSchema.optional(),
  _experimental_exitQuizMathsV0: QuizOptionalSchema.optional(),
});

export const LessonPlanSchemaWhilstStreaming = LessonPlanSchema;

// TODO old - refactor these to the new types

export type LooseLessonPlan = z.infer<typeof LessonPlanSchemaWhilstStreaming>;
export const LessonPlanKeysSchema = z.enum([
  "title",
  "subject",
  "keyStage",
  "topic",
  "learningOutcome",
  "learningCycles",
  "priorKnowledge",
  "keyLearningPoints",
  "misconceptions",
  "keywords",
  "basedOn",
  "starterQuiz",
  "exitQuiz",
  "cycle1",
  "cycle2",
  "cycle3",
  "additionalMaterials",
]);

export type LessonPlanKeys = z.infer<typeof LessonPlanKeysSchema>;
export const quizSchema = z.array(QuizSchema);

export const cycleSchema = CycleSchema;

export const keywordSchema = z.object({
  keyword: z.string(),
  definition: z.string(),
});

export const misconceptionSchema = z.object({
  misconception: z.string(),
  description: z.string(),
});

// #TODO Is this unused?
export const lessonPlanForDocsSchema = z
  .object({
    title: z.string(),
    keyStage: z.string().optional(),
    subject: z.string().optional(),
    learningOutcome: z.string().optional(),
    learningCycles: z.array(z.string()).optional(),
    priorKnowledge: z.array(z.string()).optional(),
    keyLearningPoints: z.array(z.string()).optional(),
    misconceptions: z.array(MisconceptionSchema).optional(),
    keywords: z.array(KeywordSchema).optional(),
    starterQuiz: QuizSchema.optional(),
    cycle1: CycleSchema.optional(),
    cycle2: CycleSchema.optional(),
    cycle3: CycleSchema.optional(),
    exitQuiz: QuizSchema.optional(),
    additionalMaterials: z.string().optional(),
  })
  .passthrough();

export type LessonPlanForDocsSchema = z.infer<typeof lessonPlanForDocsSchema>;

export const LessonPlanJsonSchema = zodToJsonSchema(
  CompletedLessonPlanSchema,
  "lessonPlanSchema",
);

const AilaRagRelevantLessonSchema = z.object({
  // @todo add this after next ingest
  // oakLessonId: z.number(),
  lessonPlanId: z.string(),
  title: z.string(),
});

export type AilaRagRelevantLesson = z.infer<typeof AilaRagRelevantLessonSchema>;

export const chatSchema = z
  .object({
    id: z.string(),
    path: z.string(),
    title: z.string(),
    userId: z.string(),
    lessonPlan: LessonPlanSchemaWhilstStreaming,
    relevantLessons: z.array(AilaRagRelevantLessonSchema).optional(),
    isShared: z.boolean().optional(),
    createdAt: z.union([z.date(), z.number()]),
    updatedAt: z.union([z.date(), z.number()]).optional(),
    iteration: z.number().optional(),
    startingMessage: z.string().optional(),
    messages: z.array(
      z
        .object({
          id: z.string(),
          content: z.string(),
          role: z.union([
            z.literal("function"),
            z.literal("data"),
            z.literal("user"),
            z.literal("system"),
            z.literal("assistant"),
            z.literal("tool"),
          ]),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type AilaPersistedChat = z.infer<typeof chatSchema>;

export const chatSchemaWithMissingMessageIds = z
  .object({
    id: z.string(),
    path: z.string(),
    title: z.string(),
    userId: z.string(),
    lessonPlan: LessonPlanSchemaWhilstStreaming,
    isShared: z.boolean().optional(),
    createdAt: z.union([z.date(), z.number()]),
    updatedAt: z.union([z.date(), z.number()]).optional(),
    iteration: z.number().optional(),
    startingMessage: z.string().optional(),
    messages: z.array(
      z
        .object({
          id: z.string().optional(),
          content: z.string(),
          role: z.union([
            z.literal("function"),
            z.literal("data"),
            z.literal("user"),
            z.literal("system"),
            z.literal("assistant"),
            z.literal("tool"),
          ]),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export type AilaPersistedChatWithMissingMessageIds = z.infer<
  typeof chatSchemaWithMissingMessageIds
>;

export type LessonPlanSectionWhileStreaming =
  | BasedOnOptional
  | MisconceptionsOptional
  | KeywordOptional[]
  | QuizOptional
  | CycleOptional
  | string
  | string[]
  | number;

// These are here due to zod refusing to infer the type of "add"
// TODO: GCLOMAX: Refactor this to use a union type
export const quizPathSchema = z.union([
  z.literal("/starterQuiz"),
  z.literal("/exitQuiz"),
]);

export type QuizPath = z.infer<typeof quizPathSchema>;

export const quizOperationTypeSchema = z.union([
  z.literal("add"),
  z.literal("replace"),
]);

export type QuizOperationType = z.infer<typeof quizOperationTypeSchema>;
