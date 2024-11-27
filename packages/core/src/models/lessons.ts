import type {
  Lesson,
  LessonSummary,
  PrismaClientWithAccelerate,
  QuizQuestion,
  Snippet,
  SnippetVariant,
  Transcript,
} from "@oakai/db";
import { ZLesson } from "@oakai/db";
import { ZNewLesson } from "@oakai/db/schemas/lesson";
import { aiLogger } from "@oakai/logger";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { z } from "zod";

import { inngest } from "../inngest";
import { createOpenAILangchainClient } from "../llm/langchain";
import type { SnippetWithLesson } from "./snippets";
import { Snippets } from "./snippets";
import type { Caption } from "./types/caption";
import { CaptionsSchema } from "./types/caption";

const log = aiLogger("lessons");

const EMBED_AFTER_CREATION = false;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface LessonWithSnippets {
  lesson: Omit<
    Lesson,
    | "content"
    | "captions"
    | "createdAt"
    | "updatedAt"
    | "keyStageName"
    | "subjectName"
    | "isNewLesson"
    | "newLessonContent"
  >;
  snippets: Snippet[];
}

export class Lessons {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  content(lesson: Lesson) {
    return ZLesson.parse(lesson.content);
  }

  async summariseAll(): Promise<void> {
    let page = 0;
    const perPage = 10;
    let atEnd = false;
    while (!atEnd) {
      const lessons = await this.prisma.lesson.findMany({
        skip: perPage * page,
        take: perPage,
        include: {
          summaries: true,
        },
      });
      for (const unsummarisedLesson of lessons.filter(
        (l) => l.summaries.length === 0,
      )) {
        inngest.send({
          name: "app/lesson.summarise",
          data: { lessonId: unsummarisedLesson.id },
        });
      }
      await delay(4000);
      if (lessons.length === 0) {
        atEnd = true;
      }
      page += 1;
    }
  }

  async summariseLessonsWithOutSummary(): Promise<void> {
    let page = 0;
    const perPage = 10;
    let atEnd = false;
    while (!atEnd) {
      const lessons = await this.prisma.lesson.findMany({
        skip: perPage * page,
        take: perPage,
        include: {
          summaries: true,
        },
        where: {
          isNewLesson: true,
        },
      });
      for (const unsummarisedLesson of lessons.filter(
        (l) => l.summaries.length === 0,
      )) {
        inngest.send({
          name: "app/lesson.summarise",
          data: { lessonId: unsummarisedLesson.id },
        });
      }
      await delay(4000);
      if (lessons.length === 0) {
        atEnd = true;
      }
      page += 1;
    }
  }

  async summarise(id: string): Promise<LessonSummary | undefined> {
    const lesson: Lesson | null = await this.prisma.lesson.findUnique({
      where: { id },
    });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    log.info("Summarising lesson", lesson.slug);
    log.info("new lesson", lesson.isNewLesson);
    let zLesson;
    let description;
    let transcript;
    if (!lesson.isNewLesson) {
      zLesson = ZLesson.parse(lesson.content);
      description = zLesson.lessonDescription ?? lesson.title;
      transcript = zLesson.video?.captions?.transcript;
    } else {
      zLesson = ZNewLesson.parse(lesson.newLessonContent);
      description = zLesson.pupilLessonOutcome ?? lesson.title;
      transcript = zLesson.transcriptSentences;
    }

    const model = createOpenAILangchainClient({
      app: "lesson-summarise",
      fields: {
        temperature: 0,
        modelName: "gpt-3.5-turbo-16k",
      },
    }); // or "gpt-4-32k"

    const template = `
    Context:
    You provide summaries of educational lesson videos produced by Oak National Academy in the UK, so that teachers can understand their educational content.
    It is important that you provide accurate summaries of the lessons.
    Where possible, do not include information not covered in the lesson in your summary.
    You will be given a title of a lesson, a short description of what it is about, and a full transcript of a teacher delivering the lesson via a video.
    Provide an overall summary of what the lesson is about and what students will learn from taking part in the lesson.
    Do not mention the name of the teacher.
    Where possible do not start your summary with "In this lesson" or "This lesson" and just go straight to the summary.

    Input:
    The following is the lesson you are summarising.
    Title: {title}.
    Description: {description}.
    Transcript: 
    
    {transcript}

    End of transcript.
    
    Instructions:
    In your response, provide a JSON object with the following keys: "summary", "topics", "learningObjectives", "concepts", "keywords".    
    Summary: this is the summary of the lesson.
    Topics: this is an array of strings representing the main topics or concepts covered by the lesson.
    LearningObjectives: this is an array of strings representing the learning objectives of the lesson.
    Concepts: this is an array of strings representing the main concepts covered by the lesson.
    Reasoning: provide your reasoning for your response in a JSON object with the key "reasoning".
    Keywords: this is an array of strings representing the keywords of the lesson.

    Failure cases:
    If you are unable to respond for any reason, provide your justification also in a JSON object with the key "errorMessage".
    Always respond with the JSON object and no other text before or after.
    Do not respond with an invalid JSON document.
    
    Schema:
    {format_instructions}`;
    const prompt = new PromptTemplate({
      template: template,
      inputVariables: [
        "title",
        "description",
        "transcript",
        "format_instructions",
      ],
    });

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        summary: z.string().describe("An overall summary of the lesson"),
        topics: z
          .array(z.string())
          .describe(
            "An array of strings representing the main topics covered by the lesson",
          ),
        learningObjectives: z
          .array(z.string())
          .describe(
            "An array of strings representing the learning objectives of the lesson",
          ),
        concepts: z
          .array(z.string())
          .describe(
            "An array of strings representing the main concepts discussed within the lesson",
          ),

        keywords: z
          .array(z.string())
          .describe(
            "A set of keywords which could be used to categorise the lesson to appear in search results",
          ),
      }),
    );

    const chain = RunnableSequence.from([prompt, model, parser]);

    const response = await chain.invoke({
      title: lesson.title,
      description: description,
      transcript: transcript,
      format_instructions: parser.getFormatInstructions(),
    });

    log.info(response);

    const { summary, topics, learningObjectives, concepts, keywords } =
      response;

    const lessonSummary = this.prisma.lessonSummary.create({
      data: {
        content: summary,
        lessonId: lesson.id,
        topics,
        learningObjectives,
        concepts,
        keywords,
      },
    });
    return lessonSummary;
  }

  async createQuizQuestion({
    originalQuestionId,
    question,
    lessonId,
  }: {
    originalQuestionId: number;
    question: string;
    lessonId: string;
  }): Promise<QuizQuestion> {
    const quizQuestion: QuizQuestion = await this.prisma.quizQuestion.create({
      data: {
        originalQuestionId,
        question,
        lessonId,
      },
    });

    log.info("Created quiz question", quizQuestion);
    await inngest.send({
      name: "app/quizQuestion.embed",
      data: { quizQuestionId: quizQuestion.id },
    });
    return quizQuestion;
  }

  async upsertQuizQuestion({
    question,
    lesson,
  }: {
    question: { id: number; title?: string; description?: string | null };
    lesson: Lesson;
  }) {
    const title = question.title ? question.title : "";
    const questionTitleWithPunctuation = title?.match(/\p{P}$/gu)
      ? title
      : `${title}.`;
    const questionString: string = question.description
      ? `${questionTitleWithPunctuation} ${question.description}`
      : title;
    log.info("Create question", question, lesson.id);

    let quizQuestionId: string | undefined;
    const existingQuestion = await this.prisma.quizQuestion.findFirst({
      where: { originalQuestionId: question.id },
    });
    if (!existingQuestion) {
      const quizQuestion = await this.createQuizQuestion({
        originalQuestionId: question.id,
        question: questionString,
        lessonId: lesson.id,
      });
      quizQuestionId = quizQuestion.id;
    } else {
      quizQuestionId = existingQuestion.id;
    }
    return quizQuestionId;
  }

  async createQuizAnswer({
    question,
    answer,
    lessonId,
    quizQuestionId,
  }: {
    question: { answer?: string | string[] | null | undefined };
    answer: string;
    lessonId: string;
    quizQuestionId: string;
  }) {
    log.info("Create answer", answer, lessonId);
    const existingAnswer = await this.prisma.quizAnswer.findFirst({
      where: { answer, lessonId, questionId: quizQuestionId },
    });
    if (!existingAnswer) {
      let quizAnswerId: string | undefined;
      try {
        const quizAnswer = await this.prisma.quizAnswer.create({
          data: {
            answer,
            questionId: quizQuestionId,
            lessonId: lessonId,
            distractor: answer !== question.answer,
          },
        });
        quizAnswerId = quizAnswer.id;
        log.info("Created quiz question answer", quizAnswer);
      } catch (e) {
        // For now, swallow the error until we can change the unique index
        log.error(e);
      }

      if (quizAnswerId && EMBED_AFTER_CREATION) {
        await inngest.send({
          name: "app/quizAnswer.embed",
          data: { quizAnswerId },
        });
      }
    }
  }

  async createQuizStructure(id: string): Promise<boolean> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    const zLesson = ZLesson.parse(lesson.content);
    const { quizzes } = zLesson;
    for (const quiz of quizzes) {
      for (const question of quiz.quiz.questions) {
        const quizQuestionId = await this.upsertQuizQuestion({
          question,
          lesson,
        });
        if (!quizQuestionId) {
          throw new Error("Unable to upsert quiz question");
        }
        await new Snippets(this.prisma).generateForQuestion(quizQuestionId);
        for (const answer of question.choices) {
          await this.createQuizAnswer({
            answer,
            lessonId: lesson.id,
            question,
            quizQuestionId,
          });
        }
      }
    }
    return true;
  }

  async createOriginalTranscript(id: string): Promise<Transcript> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        subject: true,
        keyStage: true,
      },
    });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    const transcript = await this.prisma.transcript.create({
      data: {
        variant: "ORIGINAL",
        lessonId: lesson.id,
      },
    });

    log.info("Created transcript", transcript);
    log.info("With captions", lesson.captions);
    let validCaptions: Caption[];
    try {
      validCaptions = CaptionsSchema.parse(lesson.captions);
    } catch (err) {
      log.error("Failed to parse captions", err);
      return transcript;
    }
    let index = 1;
    for (const caption of validCaptions) {
      log.info("Creating snippet", caption);
      const snippetAttributes = {
        sourceContent: caption.part,
        content: caption.part,
        index,
        variant: "VTT" as SnippetVariant,
        lessonId: lesson.id,
        transcriptId: transcript.id,
        subjectId: lesson.subject?.id,
        subjectSlug: lesson.subject?.slug,
        keyStageId: lesson.keyStage?.id,
        keyStageSlug: lesson.keyStage?.slug,
      };
      let snippet: Snippet | undefined;
      try {
        snippet = await this.prisma.snippet.create({
          data: snippetAttributes,
        });
      } catch (err) {
        log.error("Failed to create snippet", err);
      }
      log.info("Created snippet", snippet);
      if (snippet && EMBED_AFTER_CREATION) {
        await inngest.send({
          name: "app/snippet.embed",
          data: { snippetId: snippet.id },
        });
      }
      index++;
    }

    return transcript;
  }

  async searchByTranscript(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ): Promise<LessonWithSnippets[]> {
    const snippets: SnippetWithLesson[] = await new Snippets(
      this.prisma,
    ).search(query, keyStage, subject, perPage);
    const lessonsWithSnippets: LessonWithSnippets[] = [];
    for (const snippet of snippets) {
      if (!snippet) continue;
      const existingLesson = lessonsWithSnippets.find(
        (f) => f.lesson.id === snippet.lesson?.id,
      );
      if (!existingLesson) {
        if (snippet?.lesson) {
          lessonsWithSnippets.push({
            lesson: snippet.lesson,
            snippets: [snippet],
          });
        }
      } else {
        existingLesson.snippets.push(snippet);
      }
    }
    return lessonsWithSnippets;
  }

  async retrieve(prompt: string) {
    // Initialize a retriever wrapper around the vector store
    return new Snippets(this.prisma).retrieve(prompt);
  }
}
