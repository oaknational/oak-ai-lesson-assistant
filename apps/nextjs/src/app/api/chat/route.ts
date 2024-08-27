import {
  Aila,
  AilaAuthenticationError,
  AilaThreatDetectionError,
} from "@oakai/aila";
import type { AilaOptions, AilaPublicChatOptions, Message } from "@oakai/aila";
import { LooseLessonPlan } from "@oakai/aila/src/protocol/schema";
import { handleHeliconeError } from "@oakai/aila/src/utils/moderation/moderationErrorHandling";
import { PrismaClientWithAccelerate, prisma as globalPrisma } from "@oakai/db";
import { StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";

import { withSentry } from "@/lib/sentry/withSentry";

import { streamingJSON } from "./protocol";
import { fetchAndCheckUser } from "./user";
import { createWebActionsPlugin } from "./webActionsPlugin";

export const maxDuration = 300;

const prisma: PrismaClientWithAccelerate = globalPrisma;

function handleConnectionAborted(req: NextRequest) {
  const abortController = new AbortController();

  req.signal.addEventListener("abort", () => {
    console.log("Client has disconnected");
    abortController.abort();
  });
  return abortController;
}

export async function GET() {
  return new Response("Chat API is working", { status: 200 });
}

async function postHandler(req: NextRequest) {
  const json = await req.json();
  const {
    id,
    messages,
    lessonPlan = {},
    options: chatOptions = {},
  }: {
    id: string;
    messages: Message[];
    lessonPlan?: LooseLessonPlan;
    options?: AilaPublicChatOptions;
  } = json;

  const userLookup = await fetchAndCheckUser(id);

  if ("failureResponse" in userLookup) {
    return userLookup.failureResponse;
  }
  const userId = userLookup.userId;

  const options: AilaOptions = {
    useRag: chatOptions.useRag ?? true,
    temperature: chatOptions.temperature ?? 0.7,
    numberOfLessonPlansInRag: chatOptions.numberOfLessonPlansInRag ?? 5,
    usePersistence: true, // Do not allow the user to specify persistence
    useModeration: true,
  };

  const webActionsPlugin = createWebActionsPlugin(prisma);

  const aila = new Aila({
    chat: {
      userId,
      id,
      messages,
    },
    lessonPlan,
    options,
    prisma,
    plugins: [webActionsPlugin],
  });
  try {
    const abortController = handleConnectionAborted(req);
    const stream = await aila.generate({ abortController });
    return new StreamingTextResponse(stream);
  } catch (e) {
    // These are errors initialising the lesson, before we have started streaming

    if (e instanceof AilaAuthenticationError) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // fetchCategorisedInput calls OpenAI and can trigger helicone before we start streaming
    if (e instanceof AilaThreatDetectionError) {
      const heliconeErrorMessage = await handleHeliconeError(
        userId,
        id,
        e,
        prisma,
      );
      return streamingJSON(heliconeErrorMessage);
    }

    if (e instanceof Error) {
      return streamingJSON({
        type: "error",
        message: e.message,
        value: `Sorry, an error occurred: ${e.message}`,
      });
    }
    throw e;
  } finally {
    await aila.ensureShutdown();
  }
}

export const POST = withSentry(postHandler);
