import type {
  PrismaClientWithAccelerate,
  Snippet} from "@oakai/db";
import {
  Prisma,
  SnippetStatus,
  SnippetVariant,
} from "@oakai/db";
import { aiLogger } from "@oakai/logger";
import { LLMChain, RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";
import { difference } from "remeda";

import { inngest } from "../client";
import { createOpenAILangchainClient } from "../llm/langchain";
import { embedWithCache } from "../utils/embeddings";

const log = aiLogger("snippets");

export type DisplayFormat = "plain" | "markdown";

export type SnippetWithLesson = Snippet & {
  lesson: {
    id: string;
    title: string;
    slug: string;
    keyStageId: string | null;
    subjectId: string | null;
  };
};

const displayFormatInstructions = {
  plain: "",
  markdown:
    "Format your response as a valid Markdown document, ensuring that titles and body content all use valid markdown notation.",
};
interface FilterOptions {
  key_stage_id?: object;
  subject_id?: object;
}

export class Snippets {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async embedAll(): Promise<void> {
    const snippets = await this.prisma.snippet.findMany({
      where: {
        status: "PENDING",
      },
    });
    for (const snippet of snippets) {
      await inngest.send({
        name: "app/snippet.embed",
        data: { snippetId: snippet.id },
      });
    }
  }

  async embed(id: string): Promise<number | undefined> {
    const snippet = await this.prisma.snippet.findUnique({ where: { id } });
    if (!snippet) {
      throw new Error("Snippet not found");
    }
    if (snippet.status === SnippetStatus.SUCCESS) {
      return;
    }
    const embeddings = await embedWithCache(snippet.content);
    const vector = `[${embeddings.join(",")}]`;
    const result = await this.prisma.$executeRaw`
      UPDATE snippets
      SET embedding = ${vector}::vector
      WHERE id = ${id}`;
    return result;
  }

  async answer({
    question,
    keyStage,
    subject,
  }: {
    question: string;
    keyStage?: string;
    subject?: string;
  }) {
    const model = createOpenAILangchainClient({
      app: "snippets",
      fields: {
        temperature: 0,
        modelName: "gpt-3.5-turbo-16k",
      },
    });

    const filter: FilterOptions = {};
    if (keyStage) {
      const keyStageRecord = await this.prisma.keyStage.findFirst({
        where: {
          title: keyStage,
        },
      });
      if (keyStageRecord) {
        filter["key_stage_id"] = {
          equals: keyStageRecord.id,
        };
      }
    }
    if (subject) {
      const subjectRecord = await this.prisma.subject.findFirst({
        where: {
          title: subject,
        },
      });
      if (subjectRecord) {
        filter["subject_id"] = {
          equals: subjectRecord.id,
        };
      }
    }

    const vectorStore = PrismaVectorStore.withModel<Snippet>(
      this.prisma,
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "snippets" as "Snippet",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
      // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
      filter: Object.keys(filter).length ? filter : undefined,
    });

    // Initialize a retriever wrapper around the vector store
    const vectorStoreRetriever = vectorStore.asRetriever();

    // Create a system & human prompt for the chat model
    const SYSTEM_TEMPLATE = `Use the following pieces of context to answer the question at the end.
If you don't know the answer, just respond with "None", don't try to make up an answer.
----------------
{context}`;
    const messages = [
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
      HumanMessagePromptTemplate.fromTemplate("{question}"),
    ];
    const prompt = ChatPromptTemplate.fromMessages(messages);

    const chain = RunnableSequence.from([
      {
        context: vectorStoreRetriever.pipe(formatDocumentsAsString),
        question: new RunnablePassthrough(),
      },
      prompt,
      model,
      new StringOutputParser(),
    ]);

    const theAnswer = await chain.invoke(question);

    log.info("Generated this answer to the question", question, theAnswer);
    return theAnswer;
  }

  async search(
    query: string,
    keyStage: string | undefined,
    subject: string | undefined,
    perPage: number,
  ) {
    const filter: FilterOptions = {};
    if (keyStage) {
      const k = await this.prisma.keyStage.findFirst({
        where: {
          title: keyStage,
        },
      });
      if (k) {
        filter["key_stage_id"] = {
          equals: k.id,
        };
      }
    }
    if (subject) {
      const s = await this.prisma.subject.findFirst({
        where: {
          title: subject,
        },
      });
      if (s) {
        filter["subject_id"] = {
          equals: s.id,
        };
      }
    }

    const vectorStore = PrismaVectorStore.withModel<Snippet>(
      this.prisma,
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "snippets" as "Snippet",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
      // @ts-expect-error TODO Bug in PrismaVectorStore which doesn't allow mapped column names
      filter: Object.keys(filter).length ? filter : undefined,
    });

    const result = await vectorStore.similaritySearch(query, perPage);

    const snippets: SnippetWithLesson[] = await this.prisma.snippet.findMany({
      where: {
        id: { in: result.map((r) => r.metadata.id) },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            keyStageId: true,
            subjectId: true,
          },
        },
      },
    });

    const hydrated: SnippetWithLesson[] = [];
    for (const entry of result) {
      const snippet = snippets.find((ls) => ls.id === entry.metadata.id);
      if (!snippet) {
        throw new Error("Snippet not found");
      }
      hydrated.push(snippet);
    }
    return hydrated;
  }

  async retrieve(query: string) {
    const vectorStore = PrismaVectorStore.withModel<Snippet>(
      this.prisma,
    ).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "snippets" as "Snippet",
      vectorColumnName: "embedding",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    });
    const vectorStoreRetriever = vectorStore.asRetriever(); // 50, {} Second param is to pass optional metadata filters
    const model = createOpenAILangchainClient({
      app: "snippets",
      fields: {
        temperature: 0,
        modelName: "gpt-4",
      },
    });

    const chain = RetrievalQAChain.fromLLM(model, vectorStoreRetriever);
    const res = await chain.call({
      query,
    });
    return res;
  }

  async prompt({
    prompt,
    snippetIds,
    displayFormat,
    temperature = 0.8,
    maxTokens = 8000,
  }: {
    prompt: string;
    snippetIds: string[];
    displayFormat: DisplayFormat;
    temperature?: number;
    maxTokens?: number;
  }) {
    const snippets = await this.prisma.snippet.findMany({
      where: {
        id: {
          in: snippetIds,
        },
      },
    });

    const snippetText = snippets.map((s) => s.content).join("\n\n");

    const model = createOpenAILangchainClient({
      app: "snippets",
      fields: {
        modelName: "gpt-3.5-turbo-16k",
        temperature,
        maxTokens,
      },
    });

    const displayFormatPrompt = displayFormatInstructions[displayFormat];
    const template = PromptTemplate.fromTemplate(
      `Context:

You are provided with a set of snippets of lesson transcripts from a UK online school where a teacher has delivered a lesson to pupils and the recording of the teacher speaking has been transcribed.

Based on the provided prompt, answer it based on the content of the transcript snippets provided. These snippets are often incomplete sentences. In your response ensure that you do not follow the formatting of the transcript snippets. Format your response in full English sentences.

Where possible do not based your response on other sources other than what is present within the snippets of transcripts.

Prompt:

{prompt}

Transcript Snippets:

Use the contents of the following pieces of transcripts to formulate your response. These snippets often start with incomplete sentences. Do not follow the format of the snippets in your answer, and respond to the prompt as you normally would, ensuring that your response is grammatically correct and structured in full, correct English sentences, unless the Prompt specifies another format.

---Snippets begin----
{snippetText}
----Snippets end---

Output Format:

Ensure that your response is formatted in full English sentences with a structure that would make sense to the reader. Do not start or end your response with partial sentences.

Respond to the prompt as if it is the main prompt you are being given rather than making any reference to it.
{displayFormatPrompt}
`,
    );
    const chain = new LLMChain({
      llm: model,
      prompt: template,
    });
    const res = await chain.call({ prompt, snippetText, displayFormatPrompt });
    log.info("Prompt result", {
      res,
      prompt,
      snippetText,
      displayFormatPrompt,
    });
    return (res?.text as string) ?? "Sorry there was an error";
  }

  async generateForQuestion(questionId: string) {
    const question = await this.prisma.quizQuestion.findUniqueOrThrow({
      where: { id: questionId },
      include: {
        answers: true,
      },
    });

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: question.lessonId },
      include: {
        subject: true,
        keyStage: true,
      },
    });

    const snippets = await this.prisma.snippet.findMany({
      where: {
        questionId,
      },
    });

    if (snippets.length > 0) {
      log.info("Already has a snippet. Exiting");
      return;
    }

    const correctAnswer = question.answers.find((a) => !a.distractor);

    if (!correctAnswer) {
      log.info("Cannot find the correct answer. Exiting");
      return;
    }

    const content = `Question: ${question.question} – Correct Answer: ${correctAnswer.answer}`;

    const snippet = await this.prisma.snippet.create({
      data: {
        content,
        sourceContent: content,
        questionId: question.id,
        variant: SnippetVariant.QUESTION_AND_ANSWER,
        lessonId: question.lessonId,
        subjectId: lesson?.subject?.id,
        subjectSlug: lesson?.subject?.slug,
        keyStageId: lesson?.keyStage?.id,
        keyStageSlug: lesson?.keyStage?.slug,
      },
    });

    inngest.send({
      name: "app/snippet.embed",
      data: { snippetId: snippet.id },
    });
  }

  async generateForAllQuestions() {
    const questions: { id: string }[] = await this.prisma
      .$queryRaw`SELECT id FROM "public"."questions"`;
    const snippets: { id: string }[] = await this.prisma
      .$queryRaw`SELECT question_id as id FROM "public"."snippets" where question_id is not null`;

    const missingIds = difference(
      questions.map((i) => i.id),
      snippets.map((i) => i.id),
    );
    const Snip = new Snippets(this.prisma);

    for (const id of missingIds) {
      await Snip.generateForQuestion(id);
    }
  }
}
