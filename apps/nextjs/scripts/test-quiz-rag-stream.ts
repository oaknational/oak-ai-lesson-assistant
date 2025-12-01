/**
 * Test script for the Quiz RAG streaming endpoint.
 *
 * This script sends a request to the SSE endpoint and logs events as they stream in.
 *
 * Usage:
 *   pnpm --filter @oakai/nextjs with-env tsx scripts/test-quiz-rag-stream.ts
 *
 * Note: Requires the dev server to be running on localhost:2525
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:2525";

// Sample lesson plan for testing
const sampleLessonPlan = {
  title: "Adding fractions with the same denominator",
  subject: "maths",
  keyStage: "key-stage-2",
  topic: "Fractions",
  priorKnowledge: [
    "Understand what a fraction represents",
    "Know that fractions have a numerator and denominator",
    "Be able to identify equivalent fractions",
  ],
  keyLearningPoints: [
    "When adding fractions with the same denominator, add the numerators",
    "The denominator stays the same when adding fractions with like denominators",
    "Simplify the answer if possible",
  ],
};

interface StreamEvent {
  type: "start" | "end" | "complete" | "error";
  stage: string;
  data?: unknown;
  timestamp: number;
}

async function testStream() {
  console.log("🚀 Testing Quiz RAG Stream Endpoint");
  console.log("=".repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Lesson: ${sampleLessonPlan.title}`);
  console.log("=".repeat(60));
  console.log("");

  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}/api/debug/quiz-rag-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Note: This won't work without auth - see instructions below
      },
      body: JSON.stringify({
        lessonPlan: sampleLessonPlan,
        quizType: "/starterQuiz",
        relevantLessons: [],
      }),
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Content-Type: ${response.headers.get("content-type")}`);

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Request failed: ${response.status}`);
      console.error(error);
      console.log("");
      console.log("💡 Tip: This endpoint requires admin authentication.");
      console.log("   You can test it by:");
      console.log("   1. Opening the browser dev tools on /admin/quiz-rag");
      console.log("   2. Copying the request as cURL");
      console.log("   3. Running it in terminal to see the stream");
      return;
    }

    if (!response.body) {
      console.error("❌ No response body");
      return;
    }

    console.log("📡 Connected to stream, receiving events...\n");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let eventCount = 0;

    const stageTimings: Record<string, { start?: number; end?: number }> = {};

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const event = JSON.parse(data) as StreamEvent;
            eventCount++;

            // Track timing
            if (event.type === "start") {
              stageTimings[event.stage] = { start: event.timestamp };
            } else if (event.type === "end" && stageTimings[event.stage]) {
              stageTimings[event.stage]!.end = event.timestamp;
            }

            // Log event
            logEvent(event, eventCount);
          } catch (e) {
            console.error("Failed to parse event:", data);
          }
        }
      }
    }

    const totalTime = Date.now() - startTime;

    console.log("\n" + "=".repeat(60));
    console.log("📊 Summary");
    console.log("=".repeat(60));
    console.log(`Total events: ${eventCount}`);
    console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);
    console.log("");
    console.log("Stage timings:");
    for (const [stage, timing] of Object.entries(stageTimings)) {
      if (timing.start && timing.end) {
        const duration = timing.end - timing.start;
        console.log(`  ${stage}: ${duration}ms`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

function logEvent(event: StreamEvent, index: number) {
  const timeStr = new Date(event.timestamp)
    .toISOString()
    .split("T")[1]
    ?.slice(0, 12);

  switch (event.type) {
    case "start":
      console.log(`[${index}] ${timeStr} ▶ START  ${event.stage}`);
      break;

    case "end": {
      const data = event.data as Record<string, unknown> | undefined;
      const resultSummary = summarizeResult(event.stage, data);
      console.log(
        `[${index}] ${timeStr} ✓ END    ${event.stage} ${resultSummary}`,
      );
      break;
    }

    case "complete":
      console.log(`[${index}] ${timeStr} 🏁 COMPLETE ${event.stage}`);
      if (event.data) {
        const result = event.data as {
          timing?: { totalMs: number };
          finalQuiz?: { questions: unknown[] };
        };
        if (result.timing) {
          console.log(`    Total pipeline time: ${result.timing.totalMs}ms`);
        }
        if (result.finalQuiz) {
          console.log(
            `    Final quiz questions: ${result.finalQuiz.questions.length}`,
          );
        }
      }
      break;

    case "error":
      console.log(`[${index}] ${timeStr} ❌ ERROR  ${event.stage}`);
      console.log(`    ${JSON.stringify(event.data)}`);
      break;
  }
}

function summarizeResult(
  stage: string,
  data: Record<string, unknown> | undefined,
): string {
  if (!data) return "";

  // The result is nested under "result" key from span data
  const result = (data.result ?? data) as Record<string, unknown>;

  switch (stage) {
    case "basedOnRag":
    case "ailaRag": {
      if (!result || result === null) return "(no result)";
      const pools = result.pools as unknown[] | undefined;
      const timingMs = result.timingMs as number | undefined;
      return `(${pools?.length ?? 0} pools, ${timingMs ?? 0}ms)`;
    }

    case "mlMultiTerm": {
      if (!result || result === null) return "(no result)";
      const pools = result.pools as unknown[] | undefined;
      const searchTerms = result.searchTerms as unknown[] | undefined;
      const timingMs = result.timingMs as number | undefined;
      return `(${pools?.length ?? 0} pools, ${searchTerms?.length ?? 0} queries, ${timingMs ?? 0}ms)`;
    }

    case "imageDescriptions": {
      const totalImages = result.totalImages as number | undefined;
      const cacheHits = result.cacheHits as number | undefined;
      const timingMs = result.timingMs as number | undefined;
      return `(${totalImages ?? 0} images, ${cacheHits ?? 0} cached, ${timingMs ?? 0}ms)`;
    }

    case "llmComposer": {
      const selectedQuestions = result.selectedQuestions as
        | unknown[]
        | undefined;
      const composerTimingMs = result.composerTimingMs as number | undefined;
      return `(${selectedQuestions?.length ?? 0} selected, ${composerTimingMs ?? 0}ms)`;
    }

    case "generators":
    case "reranker":
    case "selector": {
      const durationMs = (data.durationMs ?? result.durationMs) as
        | number
        | undefined;
      return durationMs ? `(${durationMs}ms)` : "";
    }

    default:
      return "";
  }
}

// Run the test
testStream().catch(console.error);
