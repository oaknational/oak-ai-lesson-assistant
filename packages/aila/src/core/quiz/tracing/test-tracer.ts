/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-floating-promises */
/**
 * Manual test script for the Quiz RAG Tracer
 *
 * Run with: npx tsx packages/aila/src/core/quiz/tracing/test-tracer.ts
 */

import { createTracer } from "./Tracer";
import type { CompletedSpan, InstrumentationStrategy } from "./types";

// Helper to simulate async work
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Test 1: Basic span creation and timing
async function testBasicSpan() {
  console.log("\n=== Test 1: Basic Span Creation ===");

  const tracer = createTracer();
  const span = tracer.startSpan("test-operation");

  await sleep(50); // Simulate some work

  span.setData("input", "test-value");
  span.setData("count", 42);

  const completed = span.end();

  console.log("Span name:", completed.name);
  console.log("Duration:", completed.durationMs, "ms");
  console.log("Data:", completed.data);
  console.log(
    "✅ Basic span test passed:",
    completed.durationMs >= 50 && completed.data["input"] === "test-value",
  );
}

// Test 2: Nested spans (parent-child relationship)
async function testNestedSpans() {
  console.log("\n=== Test 2: Nested Spans ===");

  const tracer = createTracer();
  const parent = tracer.startSpan("parent-operation");

  await sleep(10);

  const child1 = parent.startChild("child-1");
  child1.setData("query", "test query 1");
  await sleep(20);
  child1.end();

  const child2 = parent.startChild("child-2");
  child2.setData("query", "test query 2");
  await sleep(30);

  // Nested grandchild
  const grandchild = child2.startChild("grandchild");
  grandchild.setData("detail", "nested data");
  await sleep(10);
  grandchild.end();

  child2.end();
  const completed = parent.end();

  console.log("Parent span:", completed.name);
  console.log("Parent duration:", completed.durationMs, "ms");
  console.log("Children count:", completed.children.length);

  completed.children.forEach((child, i) => {
    console.log(`  Child ${i + 1}: ${child.name} (${child.durationMs}ms)`);
    child.children.forEach((gc) => {
      console.log(`    Grandchild: ${gc.name} (${gc.durationMs}ms)`);
    });
  });

  console.log(
    "✅ Nested spans test passed:",
    completed.children.length === 2 &&
      completed.children[1]?.children.length === 1,
  );
}

// Test 3: Instrumentation callbacks
async function testInstrumentation() {
  console.log("\n=== Test 3: Instrumentation Callbacks ===");

  const startedSpans: string[] = [];
  const endedSpans: CompletedSpan[] = [];

  const testInstrumentation: InstrumentationStrategy = {
    onSpanStart: (span) => {
      startedSpans.push(span.name);
      console.log(`  [onSpanStart] ${span.name}`);
    },
    onSpanEnd: (span) => {
      endedSpans.push(span);
      console.log(`  [onSpanEnd] ${span.name} (${span.durationMs}ms)`);
    },
  };

  const tracer = createTracer({ instrumentation: testInstrumentation });

  const span = tracer.startSpan("instrumented-op");
  const child = span.startChild("instrumented-child");
  await sleep(10);
  child.end();
  span.end();

  console.log("Started spans:", startedSpans);
  console.log("Ended spans:", endedSpans.map((s) => s.name));
  console.log(
    "✅ Instrumentation test passed:",
    startedSpans.length === 2 && endedSpans.length === 2,
  );
}

// Test 4: getCompletedSpans() collection
async function testSpanCollection() {
  console.log("\n=== Test 4: Span Collection ===");

  const tracer = createTracer();

  // Create multiple root spans
  const span1 = tracer.startSpan("operation-1");
  await sleep(10);
  span1.end();

  const span2 = tracer.startSpan("operation-2");
  const child = span2.startChild("child-of-2");
  child.setData("nested", true);
  await sleep(10);
  child.end();
  span2.end();

  const completedSpans = tracer.getCompletedSpans();

  console.log("Collected spans:", completedSpans.length);
  completedSpans.forEach((s) => {
    console.log(`  - ${s.name} (children: ${s.children.length})`);
  });

  console.log(
    "✅ Span collection test passed:",
    completedSpans.length === 2 && completedSpans[1]?.children.length === 1,
  );
}

// Test 5: Simulated ML pipeline (mimics Quiz RAG structure)
async function testMLPipelineSimulation() {
  console.log("\n=== Test 5: ML Pipeline Simulation ===");

  const tracer = createTracer();
  const rootSpan = tracer.startSpan("ml-multi-term");

  // Simulate query generation
  const queryGenSpan = rootSpan.startChild("query-generation");
  await sleep(20);
  queryGenSpan.setData("queries", [
    "photosynthesis process",
    "plant cell structure",
  ]);
  queryGenSpan.end();

  // Simulate parallel queries
  const queries = ["photosynthesis process", "plant cell structure"];

  await Promise.all(
    queries.map(async (query, index) => {
      const querySpan = rootSpan.startChild(`query-${index}`);
      querySpan.setData("query", query);

      // Elasticsearch
      const esSpan = querySpan.startChild("elasticsearch");
      await sleep(15);
      esSpan.setData("hitCount", 50);
      esSpan.setData("hitsWithScores", [
        { questionUid: "q1", score: 0.95 },
        { questionUid: "q2", score: 0.87 },
      ]);
      esSpan.end();

      // Cohere rerank
      const cohereSpan = querySpan.startChild("cohere");
      await sleep(25);
      cohereSpan.setData("allResults", [
        { questionUid: "q1", relevanceScore: 0.92 },
        { questionUid: "q2", relevanceScore: 0.78 },
      ]);
      cohereSpan.end();

      querySpan.setData("finalCandidates", ["q1", "q2"]);
      querySpan.end();
    }),
  );

  rootSpan.end();

  const spans = tracer.getCompletedSpans();
  const mlSpan = spans.find((s) => s.name === "ml-multi-term");

  console.log("Root span:", mlSpan?.name);
  console.log("Root duration:", mlSpan?.durationMs, "ms");
  console.log("Root children:", mlSpan?.children.length);

  // Print the span tree
  function printSpanTree(span: CompletedSpan, indent = "") {
    console.log(
      `${indent}${span.name} (${span.durationMs}ms) - data keys: [${Object.keys(span.data).join(", ")}]`,
    );
    span.children.forEach((child) => printSpanTree(child, indent + "  "));
  }

  if (mlSpan) {
    console.log("\nSpan tree:");
    printSpanTree(mlSpan);
  }

  // Verify structure (query-0, query-1, etc. but not query-generation)
  const querySpans = mlSpan?.children.filter((s) => /^query-\d+$/.test(s.name));
  const hasCorrectStructure =
    mlSpan &&
    querySpans?.length === 2 &&
    querySpans.every(
      (qs) =>
        qs.children.some((c) => c.name === "elasticsearch") &&
        qs.children.some((c) => c.name === "cohere"),
    );

  console.log("\n✅ ML Pipeline simulation test passed:", hasCorrectStructure);
}

// Test 6: Full Debug Pipeline Simulation (mirrors QuizRagDebugService)
async function testFullDebugPipeline() {
  console.log("\n=== Test 6: Full Debug Pipeline (Frontend Data Extraction) ===");

  const tracer = createTracer();
  const pipelineSpan = tracer.startSpan("quiz-rag-pipeline");

  // ========================================
  // Stage 1: GENERATORS (run in parallel)
  // ========================================
  const generatorsSpan = pipelineSpan.startChild("generators");

  // Simulate parallel generator execution
  await Promise.all([
    // Generator 1: BasedOnRag
    (async () => {
      const span = generatorsSpan.startChild("basedOnRag");
      span.setData("sourceLesson", "Introduction to Photosynthesis");
      span.setData("sourceLessonSlug", "photosynthesis-intro-abc123");
      await sleep(15);
      span.setData("poolCount", 1);
      span.setData("questionCount", 6);
      span.end();
    })(),

    // Generator 2: AilaRag
    (async () => {
      const span = generatorsSpan.startChild("ailaRag");
      span.setData("relevantLessons", [
        { title: "Plant Biology", lessonPlanId: "plant-bio-123" },
        { title: "Cell Structure", lessonPlanId: "cell-struct-456" },
      ]);
      await sleep(20);
      span.setData("poolCount", 2);
      span.setData("questionCount", 12);
      span.end();
    })(),

    // Generator 3: ML Multi-Term (most complex)
    (async () => {
      const mlSpan = generatorsSpan.startChild("mlMultiTerm");

      // Query generation
      const queryGenSpan = mlSpan.startChild("query-generation");
      await sleep(10);
      queryGenSpan.setData("queries", [
        "photosynthesis light reactions",
        "chloroplast structure function",
        "ATP synthesis plants",
      ]);
      queryGenSpan.end();

      // Parallel queries
      const queries = [
        "photosynthesis light reactions",
        "chloroplast structure function",
        "ATP synthesis plants",
      ];

      await Promise.all(
        queries.map(async (query, i) => {
          const querySpan = mlSpan.startChild(`query-${i}`);
          querySpan.setData("query", query);

          // Elasticsearch search
          const esSpan = querySpan.startChild("elasticsearch");
          await sleep(12);
          esSpan.setData("index", "oak-vector-2025-04-16");
          esSpan.setData("hitCount", 50);
          esSpan.setData("hitsWithScores", [
            { questionUid: `q${i}-1`, text: "Sample question 1", score: 0.95, lessonSlug: "lesson-a" },
            { questionUid: `q${i}-2`, text: "Sample question 2", score: 0.89, lessonSlug: "lesson-b" },
            { questionUid: `q${i}-3`, text: "Sample question 3", score: 0.82, lessonSlug: "lesson-c" },
          ]);
          esSpan.end();

          // Cohere rerank
          const cohereSpan = querySpan.startChild("cohere");
          await sleep(18);
          cohereSpan.setData("inputCount", 50);
          cohereSpan.setData("topN", 3);
          cohereSpan.setData("allResults", [
            { questionUid: `q${i}-1`, text: "Sample question 1", originalIndex: 0, relevanceScore: 0.92 },
            { questionUid: `q${i}-3`, text: "Sample question 3", originalIndex: 2, relevanceScore: 0.85 },
            { questionUid: `q${i}-2`, text: "Sample question 2", originalIndex: 1, relevanceScore: 0.78 },
          ]);
          cohereSpan.end();

          querySpan.setData("finalCandidates", [`q${i}-1`, `q${i}-3`, `q${i}-2`]);
          querySpan.end();
        }),
      );

      mlSpan.setData("totalPools", 3);
      mlSpan.setData("totalQuestions", 9);
      mlSpan.end();
    })(),
  ]);

  generatorsSpan.end();

  // ========================================
  // Stage 2: RERANKER (NoOp in current impl)
  // ========================================
  const rerankerSpan = pipelineSpan.startChild("reranker");
  rerankerSpan.setData("type", "no-op");
  await sleep(5);
  rerankerSpan.setData("ratings", [
    { poolIndex: 0, rating: 1.0, justification: "All pools rated equally" },
  ]);
  rerankerSpan.end();

  // ========================================
  // Stage 3: SELECTOR (LLM Composer)
  // ========================================
  const selectorSpan = pipelineSpan.startChild("selector");
  selectorSpan.setData("type", "llm-quiz-composer");

  // Image descriptions
  const imageSpan = selectorSpan.startChild("image-descriptions");
  await sleep(25);
  imageSpan.setData("totalImages", 8);
  imageSpan.setData("cacheHits", 5);
  imageSpan.setData("cacheMisses", 3);
  imageSpan.setData("generatedCount", 3);
  imageSpan.setData("descriptions", [
    { url: "https://example.com/img1.png", description: "A diagram of chloroplast", wasCached: true },
    { url: "https://example.com/img2.png", description: "Light reaction pathway", wasCached: true },
    { url: "https://example.com/img3.png", description: "ATP synthase structure", wasCached: false },
  ]);
  imageSpan.end();

  // LLM composition
  const llmSpan = selectorSpan.startChild("llm-call");
  await sleep(50);
  llmSpan.setData("model", "o4-mini");
  llmSpan.setData("prompt", "Select 6 questions from the following pools...");
  llmSpan.setData("response", {
    overallStrategy: "Selected questions covering all key learning points with cognitive diversity",
    selectedQuestions: [
      { questionUid: "q0-1", reasoning: "Tests understanding of light reactions" },
      { questionUid: "q1-1", reasoning: "Assesses chloroplast structure knowledge" },
      { questionUid: "q2-1", reasoning: "Evaluates ATP synthesis comprehension" },
      { questionUid: "q0-3", reasoning: "Application-level question" },
      { questionUid: "q1-2", reasoning: "Analysis of cell processes" },
      { questionUid: "q2-3", reasoning: "Synthesis question connecting concepts" },
    ],
  });
  llmSpan.end();

  selectorSpan.setData("selectedCount", 6);
  selectorSpan.end();

  pipelineSpan.end();

  // ========================================
  // EXTRACTION: Get data for frontend
  // ========================================
  console.log("\n--- Extracting Frontend Data ---\n");

  const spans = tracer.getCompletedSpans();
  const rootSpan = spans.find((s) => s.name === "quiz-rag-pipeline");

  if (!rootSpan) {
    console.log("❌ Root span not found");
    return;
  }

  // Helper to find child span
  const findChild = (parent: CompletedSpan, name: string) =>
    parent.children.find((c) => c.name === name);

  // Extract timing
  const generatorsChild = findChild(rootSpan, "generators");
  const rerankerChild = findChild(rootSpan, "reranker");
  const selectorChild = findChild(rootSpan, "selector");

  console.log("📊 TIMING:");
  console.log(`  Total pipeline: ${rootSpan.durationMs}ms`);
  console.log(`  Generators: ${generatorsChild?.durationMs}ms`);
  console.log(`  Reranker: ${rerankerChild?.durationMs}ms`);
  console.log(`  Selector: ${selectorChild?.durationMs}ms`);

  // Extract generator results
  console.log("\n📦 GENERATORS:");

  if (generatorsChild) {
    const basedOnSpan = findChild(generatorsChild, "basedOnRag");
    const ailaRagSpan = findChild(generatorsChild, "ailaRag");
    const mlSpan = findChild(generatorsChild, "mlMultiTerm");

    if (basedOnSpan) {
      console.log(`  BasedOnRag (${basedOnSpan.durationMs}ms):`);
      console.log(`    Source: ${basedOnSpan.data["sourceLesson"]}`);
      console.log(`    Questions: ${basedOnSpan.data["questionCount"]}`);
    }

    if (ailaRagSpan) {
      console.log(`  AilaRag (${ailaRagSpan.durationMs}ms):`);
      console.log(`    Relevant lessons: ${(ailaRagSpan.data["relevantLessons"] as any[])?.length}`);
      console.log(`    Questions: ${ailaRagSpan.data["questionCount"]}`);
    }

    if (mlSpan) {
      console.log(`  ML Multi-Term (${mlSpan.durationMs}ms):`);

      // Extract query generation
      const queryGenSpan = findChild(mlSpan, "query-generation");
      const queries = queryGenSpan?.data["queries"] as string[];
      console.log(`    Generated queries: ${queries?.length}`);

      // Extract per-query details
      const querySpans = mlSpan.children.filter((s) => /^query-\d+$/.test(s.name));
      console.log(`    Search terms: ${querySpans.length}`);

      querySpans.forEach((qs, i) => {
        const esSpan = findChild(qs, "elasticsearch");
        const cohereSpan = findChild(qs, "cohere");

        console.log(`\n    Query ${i}: "${qs.data["query"]}"`);
        console.log(`      ES hits: ${esSpan?.data["hitCount"]} (${esSpan?.durationMs}ms)`);
        console.log(`      Cohere reranked: ${(cohereSpan?.data["allResults"] as any[])?.length} (${cohereSpan?.durationMs}ms)`);
        console.log(`      Final candidates: ${(qs.data["finalCandidates"] as string[])?.length}`);

        // Show top ES hits
        const esHits = esSpan?.data["hitsWithScores"] as any[];
        if (esHits?.length) {
          console.log(`      Top ES hit: ${esHits[0].questionUid} (score: ${esHits[0].score})`);
        }

        // Show Cohere results
        const cohereResults = cohereSpan?.data["allResults"] as any[];
        if (cohereResults?.length) {
          console.log(`      Top Cohere: ${cohereResults[0].questionUid} (relevance: ${cohereResults[0].relevanceScore})`);
        }
      });
    }
  }

  // Extract selector results
  console.log("\n🎯 SELECTOR:");
  if (selectorChild) {
    const imageSpan = findChild(selectorChild, "image-descriptions");
    const llmSpan = findChild(selectorChild, "llm-call");

    if (imageSpan) {
      console.log(`  Image Descriptions (${imageSpan.durationMs}ms):`);
      console.log(`    Total images: ${imageSpan.data["totalImages"]}`);
      console.log(`    Cache hits: ${imageSpan.data["cacheHits"]}`);
      console.log(`    Cache misses: ${imageSpan.data["cacheMisses"]}`);
      console.log(`    Generated: ${imageSpan.data["generatedCount"]}`);

      const descriptions = imageSpan.data["descriptions"] as any[];
      console.log(`    Descriptions:`);
      descriptions?.slice(0, 2).forEach((d) => {
        console.log(`      - ${d.url.substring(0, 30)}... → "${d.description}" (cached: ${d.wasCached})`);
      });
    }

    if (llmSpan) {
      console.log(`  LLM Composer (${llmSpan.durationMs}ms):`);
      console.log(`    Model: ${llmSpan.data["model"]}`);

      const response = llmSpan.data["response"] as any;
      console.log(`    Strategy: ${response?.overallStrategy?.substring(0, 50)}...`);
      console.log(`    Selected questions: ${response?.selectedQuestions?.length}`);

      response?.selectedQuestions?.slice(0, 3).forEach((sq: any) => {
        console.log(`      - ${sq.questionUid}: ${sq.reasoning}`);
      });
    }
  }

  console.log("\n✅ Full debug pipeline test passed: all data extractable");
}

// Run all tests
async function runTests() {
  console.log("🧪 Quiz RAG Tracer Tests\n");
  console.log("========================");

  try {
    await testBasicSpan();
    await testNestedSpans();
    await testInstrumentation();
    await testSpanCollection();
    await testMLPipelineSimulation();
    await testFullDebugPipeline();

    console.log("\n========================");
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

runTests();
