import type { PrismaClientWithAccelerate } from "@oakai/db";
import { aiLogger } from "@oakai/logger";

import { Document } from "langchain/document";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { RunnableSequence } from "langchain/schema/runnable";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { z } from "zod";

import { createOpenAILangchainClient } from "../llm/langchain";

const log = aiLogger("transcripts");

interface TranscriptWithRaw {
  raw: string;
}

export class Transcripts {
  constructor(private readonly prisma: PrismaClientWithAccelerate) {}

  async splitWithTextSplitter(id: string): Promise<void> {
    const transcript = await this.prisma.transcript.findUnique({
      where: { id },
    });
    if (!transcript) {
      throw new Error("Transcript not found");
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 200,
    });

    const text = (transcript.content as unknown as TranscriptWithRaw).raw;

    const docs = await splitter.splitDocuments([
      new Document({ pageContent: text }),
    ]);

    await this.createSnippets({
      lessonId: transcript.lessonId,
      transcriptId: transcript.id,
      texts: docs.map((doc) => doc.pageContent),
    });
  }

  async createSnippets({
    lessonId,
    transcriptId,
    texts,
  }: {
    lessonId: string;
    transcriptId: string;
    texts: string[];
  }): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        subject: true,
        keyStage: true,
      },
    });
    let index = 0;
    for (const text of texts) {
      const createdSnippet = await this.prisma.snippet.create({
        data: {
          index: index++,
          sourceContent: text,
          content: text,
          lessonId,
          transcriptId,
          subjectId: lesson?.subject?.id,
          subjectSlug: lesson?.subject?.slug,
          keyStageId: lesson?.keyStage?.id,
          keyStageSlug: lesson?.keyStage?.slug,
        },
      });

      log.info("Schedule snippet embedding", {
        snippetId: createdSnippet.id,
      });

      // await inngest.send({
      //   name: "app/snippet.embed",
      //   data: { snippetId: createdSnippet.id },
      // });
    }
  }

  async splitWithGPT(id: string): Promise<void> {
    const transcript = await this.prisma.transcript.findUnique({
      where: { id },
    });
    if (!transcript) {
      throw new Error("Transcript not found");
    }
    const template = `Context:
  You are a helpful service which makes it easy to break up long transcripts of UK teachers delivering a lesson to students.
  Split the following lesson transcript into short snippets of text, each containing one, two or three sentences representing a single idea or concept.
  
  The lesson transcript is as follows:

  Transcript starts.
  
  {transcript_text}

  Transcript ends.

  Rules:
  The snippets you create will be used to create a summary of the transcript.
  Accuracy is important, so make sure you do not miss any important information.
  Remove any minor extraneous content, such as:
  * The name of the speaker
  * Where the speaker says "um" or "err"
  * Information only relevant to how the lesson is delivered, such as "click here" or "turn to page 3"
  * Information only relevant to the video, such as "pause the video"
  The snippets should be in the same order as the transcript.
  The snippets should be separated by a new line.
  The snippets should be no longer than 500 characters.
  The snippets should be no shorter than 50 characters.
  Do not include any additional information in your response.
  Do not include any information about the lesson in your response.
  Do not include any information about the speaker in your response.
  Do not extend the length of the snippet beyond the length of the original sentence.
  Do not include information not covered in the lesson in your snippets.

  Response:
  Your response should be a JSON document containing an array of strings, each of which is a single sentence or a few sentences.
  Do not respond with a cut off or incomplete JSON document.
  Your response should match the following schema definition:
  {format_instructions}`;

    log.info(template);

    const parser = StructuredOutputParser.fromZodSchema(
      z.object({
        snippets: z
          .array(z.string())
          .describe("snippets of the transcript to be summarised"),
      }),
    );

    const openAi = createOpenAILangchainClient({
      app: "transcripts",
      fields: { modelName: "gpt-4-32k", temperature: 0 },
    });
    const chain = RunnableSequence.from([
      PromptTemplate.fromTemplate(template),
      openAi,
      parser,
    ]);

    const format_instructions = parser.getFormatInstructions();

    log.info("Format instructions", format_instructions);

    const transcript_text = (transcript.content as unknown as TranscriptWithRaw)
      .raw;
    const response = await chain.invoke({
      transcript_text,
      format_instructions,
    });

    log.info("Got response", { response });

    const { snippets } = response;

    await this.createSnippets({
      lessonId: transcript.lessonId,
      transcriptId: transcript.id,
      texts: snippets,
    });
  }
}
