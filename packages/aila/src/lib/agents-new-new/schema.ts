import { z } from "zod";

const sectionKeysSchema = z.union([
  z.literal("title"),
  z.literal("keyStage"),
  z.literal("subject"),
  z.literal("basedOn"),
  z.literal("learningOutcome"),
  z.literal("learningCycles"),
  z.literal("priorKnowledge"),
  z.literal("keyLearningPoints"),
  z.literal("misconceptions"),
  z.literal("keywords"),
  z.literal("starterQuiz"),
  z.literal("cycle1"),
  z.literal("cycle2"),
  z.literal("cycle3"),
  z.literal("exitQuiz"),
  z.literal("additionalMaterials"),
]);

export type SectionKey = z.infer<typeof sectionKeysSchema>;

const parsedUserMessageSchema = z
  .string()
  .describe(
    "A clear and consistent description of the user's intent. E.g. 'The user wants to make the keywords shorter', or 'The user as signalled positive intent, likely they want to continue without steering the conversation in a different direction.'",
  );

const sectionStepSchema = z
  .object({
    type: z
      .literal("section")
      .describe("Indicates a section content mutation step."),
    sectionKey: sectionKeysSchema.describe(
      "Target section key for this operation.",
    ),
    action: z.enum(["generate", "delete"]),
  })
  .describe("Section plan step.");

export const plannerOutputSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("plan"),
    parsedUserMessage: parsedUserMessageSchema,
    plan: z.array(sectionStepSchema),
  }),
  z.object({
    decision: z.literal("exit"),
    parsedUserMessage: parsedUserMessageSchema,
    reasonType: z.union([
      z
        .literal("out_of_scope")
        .describe(
          "The user's request is outside the scope of this application. See SCOPE",
        ), // @todo define scope
      z
        .literal("capability_limitation")
        .describe(
          "The system lacks the capability to fulfil the request. See CAPABILITIES",
        ), // @todo define capabilities
      z
        .literal("clarification_needed")
        .describe(
          "The user's request is unclear and requires further clarification.",
        ),
      z
        .literal("relevant_query")
        .describe(
          "The user's request is relevant. See RELEVANT_QUERIES. In this case, provide additional information that you have access to, so that a downstream agent can use it to respond appropriately.",
        ), //  @todo define capabilities
    ]),
    reasonJustification: z.string(),
    additionalInfo: z
      .string()
      .nullable()
      .describe(
        "Any additional information to provide context for the downstream agent.",
      ),
  }),
]);

export type SectionStep = z.infer<typeof sectionStepSchema>;
export type PlanStep = z.infer<typeof sectionStepSchema>;
export type PlannerOutput = z.infer<typeof plannerOutputSchema>;

export const errorSchema = z.object({
  message: z.string().describe("Error message"),
});

export type GenericPromptAgentPrompt<ResponseType> = {
  responseSchema: z.ZodType<ResponseType>;
  input: (
    | { role: "developer"; content: string }
    | { role: "user"; content: string }
  )[];
};

/**
 * Section Agents are agents which generate or manipulate sections of the document.
 */
export const SECTION_AGENT_IDS = [
  "keyStage--default",
  "subject--default",
  "title--default",
  "basedOn--default",
  "learningOutcome--default",
  "learningCycleOutcomes--default",
  "priorKnowledge--default",
  "keyLearningPoints--default",
  "misconceptions--default",
  "keywords--default",
  "starterQuiz--default",
  "starterQuiz--maths",
  "cycle--default",
  "exitQuiz--default",
  "exitQuiz--maths",
  "additionalMaterials--default",
] as const;
export type SectionAgentId = (typeof SECTION_AGENT_IDS)[number];
