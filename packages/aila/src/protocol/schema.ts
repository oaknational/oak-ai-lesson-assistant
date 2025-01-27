import dedent from "dedent";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { minMaxText } from "./schemaHelpers";

// ********** BASED_ON **********
export const BASED_ON_DESCRIPTIONS = {
  id: dedent`The database ID of an existing lesson plan that this lesson plan is based upon.
    It should be the ID of the lesson plan that was used to inform the content of this lesson plan.
    It should not be the number that the user has selected when choosing which lesson on which to base their new lesson.`,
  title: "The human-readable title of the lesson.",
  schema: dedent`A reference to a lesson plan that this lesson is based on.
    This value should only be set if the user has explicitly chosen to base their lesson on an existing lesson plan by selecting one from a selection of options, otherwise this should be blank.`,
} as const;

export const BasedOnSchema = z
  .object({
    id: z.string().describe(BASED_ON_DESCRIPTIONS.id),
    title: z.string().describe(BASED_ON_DESCRIPTIONS.title),
  })
  .describe(BASED_ON_DESCRIPTIONS.schema);
export type BasedOn = z.infer<typeof BasedOnSchema>;

export const BasedOnOptionalSchema = BasedOnSchema.partial();
export type BasedOnOptional = z.infer<typeof BasedOnOptionalSchema>;

// ********** MISCONCEPTIONS **********
export const MISCONCEPTION_DESCRIPTIONS = {
  misconception: dedent`a single sentence describing a common misconception about the topic. Do not end with a full stop.`,
  description: dedent`No more than 2 sentences addressing the reason for the misconception and how it can be addressed in the lesson.`,
} as const;

export const MISCONCEPTIONS_DESCRIPTION = {
  schema: dedent`
  A set of potential misconceptions which students might have about the content that is delivered in the lesson.
  Written in the EXPERT_TEACHER voice.
  ${minMaxText({ min: 1, max: 3, entity: "elements" })}`,
} as const as { schema: string };

export const MisconceptionSchemaWithoutLength = z.object({
  misconception: z.string().describe(MISCONCEPTION_DESCRIPTIONS.misconception),
  description: z.string().describe(MISCONCEPTION_DESCRIPTIONS.description),
});

export const MisconceptionSchema = MisconceptionSchemaWithoutLength.extend({
  description: MisconceptionSchemaWithoutLength.shape.description.max(250),
});

export const MisconceptionOptionalSchema =
  MisconceptionSchemaWithoutLength.extend({
    definition: z.string().optional(),
  }).partial();

export const MisconceptionsSchemaWithoutLength = z
  .array(MisconceptionSchemaWithoutLength)
  .describe(MISCONCEPTIONS_DESCRIPTION.schema);

export const MisconceptionsSchema =
  MisconceptionsSchemaWithoutLength.min(1).max(3);

export const MisconceptionsOptionalSchema = z.array(
  MisconceptionOptionalSchema,
);

export type Misconception = z.infer<typeof MisconceptionSchema>;
export type MisconceptionOptional = z.infer<typeof MisconceptionOptionalSchema>;
export type MisconceptionsOptional = z.infer<
  typeof MisconceptionsOptionalSchema
>;

// ********** QUIZ **********

export const QUIZ_DESCRIPTIONS = {
  question: "The question to be asked in the quiz.",
  answers: "The correct answer. This should be an array of only one item.",
  distractors: "A set of distractors. This must be an array with two items.",
} as const as {
  question: string;
  answers: string;
  distractors: string;
};

export const QuizQuestionSchemaWithoutLength = z.object({
  question: z.string().describe(QUIZ_DESCRIPTIONS.question),
  answers: z.array(z.string()).describe(QUIZ_DESCRIPTIONS.answers),
  distractors: z.array(z.string()).describe(QUIZ_DESCRIPTIONS.distractors),
});

export const QuizQuestionSchema = QuizQuestionSchemaWithoutLength.extend({
  answers: QuizQuestionSchemaWithoutLength.shape.answers.length(1),
  distractors: QuizQuestionSchemaWithoutLength.shape.distractors.length(2),
});

export const QuizQuestionOptionalSchema = QuizQuestionSchema.partial();

export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizQuestionOptional = z.infer<typeof QuizQuestionOptionalSchema>;

export const QuizSchema = z.array(QuizQuestionSchema);
export const QuizSchemaWithoutLength = z.array(QuizQuestionSchemaWithoutLength);
export const QuizOptionalSchema = z.array(QuizQuestionOptionalSchema);

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizOptional = z.infer<typeof QuizOptionalSchema>;

// ********** EXPLANATION **********
export const EXPLANATION_DESCRIPTIONS = {
  spokenExplanation: dedent`The spoken teacher explanation in the EXPERT_TEACHER voice.
  About five or six sentences or 5-12 markdown list items.
  In the spoken explanation, give guidance to the teacher on which key points should be covered in their explanation to students.
  This should be teacher facing and not include a script or narrative for the teacher.
  Should bear in mind the following requirements:
  - teacher facing 
  - outline the key points that the teacher should address during their explanation 
  - include as much detail as possible
  - written in bullet points  
  - break concepts into small, manageable chunks
  - if appropriate, the method for explanation should be included for e.g. demonstrate to pupils how to set up the apparatus for the experiment or model how to complete the pass for students or use a bar model to show the addition of these three numbers.
  - abstract concepts are made concrete
  - the explanation should be clear
  - images will be used to support dual coding for pupils`,
  accompanyingSlideDetails: dedent`A description of the image or video to be used.
  Should describe what should be displayed on the slides for pupils to look at during the explanation.
  This is to enable dual coding of a visual image and the teachers explanation being given verbally.
  Written in the EXPERT_TEACHER voice.`,
  imagePrompt: dedent`A prompt to generate an image, or a search term to use to find an image or video.
  Should tell the teacher what images to search for to display on the slides.
  Written in the EXPERT_TEACHER voice.`,
  slideText: dedent`The slide text would appear on the slide when the teacher delivers this part of the lesson.
  It should be a short, succinct summary of the content in the explanation.
  It should be no longer than 2 sentences.
  Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  schema: dedent`The TEACHER EXPLANATION, obeying the learning cycle rules for this part of the lesson.`,
} as const;

export const ExplanationSchema = z
  .object({
    spokenExplanation: z
      .union([z.string(), z.array(z.string())])
      .describe(EXPLANATION_DESCRIPTIONS.spokenExplanation),
    accompanyingSlideDetails: z
      .string()
      .describe(EXPLANATION_DESCRIPTIONS.accompanyingSlideDetails),
    imagePrompt: z.string().describe(EXPLANATION_DESCRIPTIONS.imagePrompt),
    slideText: z.string().describe(EXPLANATION_DESCRIPTIONS.slideText),
  })
  .describe(EXPLANATION_DESCRIPTIONS.schema);

export type Explanation = z.infer<typeof ExplanationSchema>;

export const ExplanationOptionalSchema = ExplanationSchema.partial();
export type ExplanationOptional = z.infer<typeof ExplanationOptionalSchema>;

// ********** CHECK FOR UNDERSTANDING **********
// When using Structured Outputs we cannot specify the length of arrays or strings
export const CHECK_FOR_UNDERSTANDING_DESCRIPTIONS = {
  question: dedent`A multiple choice question to ask as a check to see if the students have understood the content of this cycle.
  Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  answers: dedent`The correct answer to the question.
  If this is of length ANSWER_LENGTH, then all distractor strings should be very close in length to ANSWER_LENGTH.`,
  distractors: dedent`Two incorrect distractors which could be the answer to the question but are not correct.
  These strings should be of similar length to ANSWER_LENGTH so that the correct answer does not stand out because it is obviously longer than the distractors.`,
} as const;

export const CheckForUnderstandingSchemaWithoutLength = z.object({
  question: z.string().describe(CHECK_FOR_UNDERSTANDING_DESCRIPTIONS.question),
  answers: z
    .array(z.string())
    .describe(CHECK_FOR_UNDERSTANDING_DESCRIPTIONS.answers),
  distractors: z
    .array(z.string())
    .describe(CHECK_FOR_UNDERSTANDING_DESCRIPTIONS.distractors),
});

export const CheckForUnderstandingSchema =
  CheckForUnderstandingSchemaWithoutLength.extend({
    answers: CheckForUnderstandingSchemaWithoutLength.shape.answers.length(1),
    distractors:
      CheckForUnderstandingSchemaWithoutLength.shape.distractors.min(2),
  });

export const CheckForUnderstandingOptionalSchema =
  CheckForUnderstandingSchema.partial();

// ********** CYCLE **********
export const CYCLE_DESCRIPTIONS = {
  title: `The title of the learning cycle written in sentence case starting with a capital letter and not ending with a full stop.`,
  durationInMinutes: `An estimated duration for how long it would take the teacher to deliver this part of the lesson.`,
  explanation: dedent`An object describing how the teacher would explain the content of this cycle to the students.
  Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  checkForUnderstanding: dedent`Two or more questions to check that students have understood the content of this cycle.
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  practice: dedent`The activity that the pupils are asked to do to practice what they have learnt. 
    Should be pupil facing and include all details that the pupils need to complete the task. 
    Should be linked to the learning cycle command word and should enable pupils to practice the key learning points that have been taught during this learning cycle. 
    Should include calculations if this is appropriate.
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  feedback: dedent`Student-facing feedback which will be presented on a slide, giving the correct answer to the practice task.
    This should adhere to the rules as specified in the LEARNING CYCLES: FEEDBACK section of the lesson plan guidance.
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
} as const;

export const CycleSchemaWithoutLength = z.object({
  title: z.string().describe(CYCLE_DESCRIPTIONS.title),
  durationInMinutes: z.number().describe(CYCLE_DESCRIPTIONS.durationInMinutes),
  explanation: ExplanationSchema.describe(CYCLE_DESCRIPTIONS.explanation),
  checkForUnderstanding: z
    .array(CheckForUnderstandingSchemaWithoutLength)
    .describe(CYCLE_DESCRIPTIONS.checkForUnderstanding),
  practice: z.string().describe(CYCLE_DESCRIPTIONS.practice),
  feedback: z.string().describe(CYCLE_DESCRIPTIONS.feedback),
});

export const CycleSchema = CycleSchemaWithoutLength.extend({
  checkForUnderstanding: z.array(CheckForUnderstandingSchema).min(2),
});

export const CycleOptionalSchema = CycleSchemaWithoutLength.extend({
  explanation: ExplanationOptionalSchema.optional(),
  checkForUnderstanding: z
    .array(CheckForUnderstandingOptionalSchema)
    .optional(),
}).partial();

export type CycleOptional = z.infer<typeof CycleOptionalSchema>;
export type Cycle = z.infer<typeof CycleSchema>;

// ********** KEYWORDS **********
export const KEYWORD_DESCRIPTIONS = {
  keyword: dedent`The keyword itself.
  Should be written in lowercase apart from proper nouns and not end with a full stop.`,
  definition: dedent`A short definition of the keyword including the keyword itself. This definition should be written in lowercase apart from proper nouns and not end with a full stop.  Written in TEACHER_TO_PUPIL_SLIDES voice.`,
  description: "Not to be used, and included here only for legacy purposes.",
  schema: dedent`A keyword that is used in the lesson.
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  keywords: dedent`The keywords that are used in the lesson.
    Written in the TEACHER_TO_PUPIL_SLIDES voice.
    ${minMaxText({ min: 1, max: 5, entity: "elements" })}`,
} as const;

export const KeywordSchemaWithoutLength = z
  .object({
    keyword: z.string().describe(KEYWORD_DESCRIPTIONS.keyword),
    definition: z.string().describe(KEYWORD_DESCRIPTIONS.definition),
  })
  .describe(KEYWORD_DESCRIPTIONS.schema);

export const KeywordSchema = KeywordSchemaWithoutLength.extend({
  keyword: KeywordSchemaWithoutLength.shape.keyword.max(30),
  definition: KeywordSchemaWithoutLength.shape.definition.max(200),
  description: z.string().optional().describe(KEYWORD_DESCRIPTIONS.description),
});

export const KeywordOptionalSchema = KeywordSchema.partial();

export const KeywordsSchemaWithoutLength = z
  .array(KeywordSchemaWithoutLength)
  .describe(KEYWORD_DESCRIPTIONS.keywords);

export const KeywordsSchema = KeywordsSchemaWithoutLength.min(1).max(5);

export const KeywordsOptionalSchema = z.array(KeywordOptionalSchema);

export type KeywordOptional = z.infer<typeof KeywordOptionalSchema>;
export type Keyword = z.infer<typeof KeywordSchema>;

// ********** LESSON PLAN **********
export const LESSON_PLAN_DESCRIPTIONS = {
  title: dedent`The title of the lesson. Lesson titles should be a unique and succinct statement, not a question. 
    Can include special characters if appropriate but should not use & sign instead of 'and'. 
    Written in the TEACHER_TO_PUPIL_SLIDES voice.
    The title should be in sentence case starting with a capital letter and not end with a full stop. 
    ${minMaxText({
      max: 80,
      entity: "characters",
    })}`,
  keyStage:
    "The lesson's Key Stage as defined by UK educational standards. In slug format (kebab-case).",
  subject:
    "The subject that this lesson is included within, for instance English or Geography.",
  topic:
    "A topic that this lesson would sit within, which might cover several lessons with a shared theme.",
  learningOutcome: dedent`What the pupils will have learnt by the end of the lesson.
    Should start with 'I can' and outline what pupils should be able to know/and or be able to do by the end of the lesson. 
    Written in age appropriate language. 
    May include a command word. 
    Written in the PUPIL voice. 
    ${minMaxText({ max: 190, entity: "characters" })}`,
  learningCycles: dedent`An array of learning cycle outcomes. 
    Should include a command word. 
    Should be succinct. 
    Should outline what pupils should be able to do/understand/know by the end of the learning cycle. 
    Written in the TEACHER_TO_PUPIL_SLIDES voice. 
    ${minMaxText({
      min: 1,
      max: 3,
      entity: "elements",
    })}`,
  priorKnowledge: dedent`An array of prior knowledge statements, each being a succinct sentence. 
    Written in the EXPERT_TEACHER voice. 
    ${minMaxText({
      min: 1,
      max: 5,
      entity: "elements",
    })}`,
  keyLearningPoints: dedent`An array of learning points, each being a succinct sentence. 
    ${minMaxText({
      min: 3,
      max: 5,
      entity: "elements",
    })}`,
  starterQuiz: dedent`The starter quiz for the lesson, which tests prior knowledge only, ignoring the content that is delivered in the lesson. 
    Obey the rules as specified in the STARTER QUIZ section of the lesson plan guidance. 
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  exitQuiz: dedent`The exit quiz for the lesson, which tests the content that is delivered in the lesson. 
    Written in the TEACHER_TO_PUPIL_SLIDES voice.`,
  additionalMaterials:
    "Any additional materials or notes that are required or useful for the lesson",
} as const;

export const LessonTitleSchema = z
  .string()
  .describe(LESSON_PLAN_DESCRIPTIONS.title);

export const KeyStageSchema = z
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
  .describe(LESSON_PLAN_DESCRIPTIONS.keyStage);

export const SubjectSchema = z
  .string()
  .describe(LESSON_PLAN_DESCRIPTIONS.subject);

export const TopicSchema = z.string().describe(LESSON_PLAN_DESCRIPTIONS.topic);

export const LearningOutcomeSchema = z
  .string()
  .describe(LESSON_PLAN_DESCRIPTIONS.learningOutcome);

export const LearningCyclesSchema = z
  .array(z.string())
  .describe(LESSON_PLAN_DESCRIPTIONS.learningCycles);

export const PriorKnowledgeSchema = z
  .array(z.string())
  .describe(LESSON_PLAN_DESCRIPTIONS.priorKnowledge);

export const KeyLearningPointsSchema = z
  .array(z.string())
  .describe(LESSON_PLAN_DESCRIPTIONS.keyLearningPoints);

export const AdditionalMaterialsSchema = z
  .string()
  .optional()
  .describe(LESSON_PLAN_DESCRIPTIONS.additionalMaterials);

// Main schema
export const CompletedLessonPlanSchema = z.object({
  title: LessonTitleSchema,
  keyStage: KeyStageSchema,
  subject: SubjectSchema,
  topic: TopicSchema,
  learningOutcome: LearningOutcomeSchema,
  learningCycles: LearningCyclesSchema,
  priorKnowledge: PriorKnowledgeSchema,
  keyLearningPoints: KeyLearningPointsSchema,
  misconceptions: MisconceptionsSchema,
  keywords: KeywordsSchema,
  basedOn: BasedOnSchema.optional(),
  starterQuiz: QuizSchema.describe(LESSON_PLAN_DESCRIPTIONS.starterQuiz),
  cycle1: CycleSchema.describe("The first learning cycle"),
  cycle2: CycleSchema.describe("The second learning cycle"),
  cycle3: CycleSchema.describe("The third learning cycle"),
  exitQuiz: QuizSchema.describe(LESSON_PLAN_DESCRIPTIONS.exitQuiz),
  additionalMaterials: AdditionalMaterialsSchema,
});

export type CompletedLessonPlan = z.infer<typeof CompletedLessonPlanSchema>;

export const LessonPlanSchema = CompletedLessonPlanSchema.partial().extend({
  _experimental_starterQuizMathsV0: QuizOptionalSchema.optional(),
  _experimental_exitQuizMathsV0: QuizOptionalSchema.optional(),
});

export const LessonPlanSchemaWhilstStreaming = LessonPlanSchema;

// TODO old - refactor these to the new types

export type LooseLessonPlan = z.infer<typeof LessonPlanSchemaWhilstStreaming>;

export type LessonPlanKey = keyof typeof CompletedLessonPlanSchema.shape;

export const LessonPlanJsonSchema = zodToJsonSchema(
  CompletedLessonPlanSchema,
  "lessonPlanSchema",
);

const AilaRagRelevantLessonSchema = z.object({
  oakLessonId: z.number().nullish(),
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

export const CompletedLessonPlanSchemaWithoutLength = z.object({
  title: LessonTitleSchema,
  keyStage: KeyStageSchema,
  subject: SubjectSchema,
  topic: TopicSchema,
  learningOutcome: LearningOutcomeSchema,
  learningCycles: LearningCyclesSchema,
  priorKnowledge: PriorKnowledgeSchema,
  keyLearningPoints: KeyLearningPointsSchema,
  misconceptions: MisconceptionsSchemaWithoutLength,
  keywords: KeywordsSchemaWithoutLength,
  starterQuiz: QuizSchemaWithoutLength.describe(
    LESSON_PLAN_DESCRIPTIONS.starterQuiz,
  ),
  cycle1: CycleSchemaWithoutLength.describe("The first learning cycle"),
  cycle2: CycleSchemaWithoutLength.describe("The second learning cycle"),
  cycle3: CycleSchemaWithoutLength.describe("The third learning cycle"),
  exitQuiz: QuizSchemaWithoutLength.describe(LESSON_PLAN_DESCRIPTIONS.exitQuiz),
  additionalMaterials: AdditionalMaterialsSchema,
});
