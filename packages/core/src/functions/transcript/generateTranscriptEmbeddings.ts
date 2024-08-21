import { TranscriptStatus, prisma } from "@oakai/db";

import { inngest } from "../../client";
import { Transcripts } from "../../models/transcript";

export const generateTranscriptEmbeddings = inngest.createFunction(
  { name: "Generate embeddings for a transcript", id: "app-transcript-embed" },
  { event: "app/transcript.embed" },
  async ({ event, step }) => {
    const { transcriptId } = event.data;

    await step.run(
      "Get OpenAI embedding  for snippet and store in database",
      async () => {
        await prisma.transcript.findFirstOrThrow({
          where: { id: transcriptId },
        });

        await new Transcripts(prisma).splitWithTextSplitter(transcriptId);

        return {
          transcriptId,
        };
      },
    );

    await step.run("Update status to SUCCESS", async () => {
      await prisma.transcript.update({
        where: { id: transcriptId },
        data: { status: TranscriptStatus.SUCCESS, updatedAt: new Date() },
      });
    });

    return { transcriptId };
  },
);
