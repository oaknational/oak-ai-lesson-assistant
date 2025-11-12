import { Client } from "@elastic/elasticsearch";

import type { QuizQuestionTextOnlySource } from "../interfaces";

async function checkRawJsonTypes() {
  const client = new Client({
    cloud: {
      id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string,
    },
    auth: {
      apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string,
    },
  });

  console.log("=== Checking raw_json field types across ES index ===\n");

  // First, get total count
  const countResponse = await client.count({
    index: "quiz-questions-text-only-2025-04-16",
  });

  const totalDocs =
    typeof countResponse.count === "number" ? countResponse.count : 0;
  console.log(`Total documents in index: ${totalDocs.toLocaleString()}`);

  // Sample 5000 documents (or all if fewer)
  const sampleSize = Math.min(10000, totalDocs);
  console.log(`Sampling: ${sampleSize.toLocaleString()} documents\n`);

  const response = await client.search({
    index: "quiz-questions-text-only-2025-04-16",
    size: sampleSize,
    body: {
      query: {
        match_all: {},
      },
    },
  });

  console.log(`Retrieved: ${response.hits.hits.length} documents\n`);

  let objectCount = 0;
  let arrayCount = 0;
  let errorCount = 0;
  const arrayExamples: string[] = [];

  for (const hit of response.hits.hits) {
    try {
      if (!hit._source?.metadata?.raw_json) {
        errorCount++;
        continue;
      }

      const parsed = JSON.parse(hit._source.metadata.raw_json);

      if (Array.isArray(parsed)) {
        arrayCount++;
        if (arrayExamples.length < 3) {
          arrayExamples.push(hit._source.metadata.questionUid);
          console.log(`FOUND ARRAY at ${hit._source.metadata.questionUid}:`);
          console.log(`  Array length: ${parsed.length}`);
          console.log(
            `  First element keys: ${Object.keys(parsed[0] || {}).join(", ")}\n`,
          );
        }
      } else if (typeof parsed === "object" && parsed !== null) {
        objectCount++;
      }
    } catch (error) {
      errorCount++;
      console.error(
        `Parse error for ${hit._source?.metadata?.questionUid}:`,
        error,
      );
    }
  }

  console.log("=== Results ===");
  console.log(`Objects (single question): ${objectCount}`);
  console.log(`Arrays: ${arrayCount}`);
  console.log(`Errors/Missing: ${errorCount}`);
  console.log(
    `\nPercentage that are objects: ${((objectCount / response.hits.hits.length) * 100).toFixed(2)}%`,
  );

  if (arrayCount === 0) {
    console.log(
      "\n✅ All sampled documents have raw_json as a single object (not array)",
    );
    console.log("   The array normalization in code may be unnecessary!");
  } else {
    console.log(`\n⚠️ Found ${arrayCount} arrays in sample`);
    console.log("Examples:", arrayExamples);
  }

  // Also check if the parsed objects have questionUid
  console.log("\n=== Checking for questionUid in raw_json ===");
  // const sampleWithUid = response.hits.hits.slice(0, 10);
  let hasQuestionUid = 0;

  for (const hit of response.hits.hits) {
    try {
      const parsed = JSON.parse(hit._source.metadata.raw_json);
      if (parsed?.questionUid) {
        hasQuestionUid++;
      }
    } catch (error) {
      // Skip
    }
  }

  console.log(`${hasQuestionUid} have questionUid in raw_json`);
}

checkRawJsonTypes().catch(console.error);
