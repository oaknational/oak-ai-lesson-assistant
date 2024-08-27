import z from "zod";

export const inputSchema = z.object({
  subject: z.string(),
  keyStage: z.string(),
  ageRange: z.string(),
  lessonTitle: z.string(),
  topic: z.string().optional(),
  lessonPlanJson: z.string(),
  quizType: z.literal("exitQuiz").or(z.literal("starterQuiz")),
});
