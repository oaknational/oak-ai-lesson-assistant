import { Client } from "@elastic/elasticsearch";

async function inspectQuestion() {
  const client = new Client({
    cloud: {
      id: process.env.I_DOT_AI_ELASTIC_CLOUD_ID as string,
    },
    auth: {
      apiKey: process.env.I_DOT_AI_ELASTIC_KEY as string,
    },
  });

  // Use a known UID from tests
  const questionUid = process.argv[2] || "QUES-EYPJ1-67826";

  console.log(`\n=== Searching for question: ${questionUid} ===\n`);

  const response = await client.search({
    index: "quiz-questions-text-only-2025-04-16",
    body: {
      query: {
        bool: {
          must: [
            {
              terms: {
                "metadata.questionUid.keyword": [questionUid],
              },
            },
          ],
        },
      },
    },
  });

  console.log("Total hits:", response.hits.total);
  console.log("\n=== First hit structure ===\n");

  const hit = response.hits.hits[0];
  if (!hit) {
    console.log("No hits found!");
    return;
  }

  console.log("Hit keys:", Object.keys(hit));
  console.log("\n_source keys:", Object.keys(hit._source || {}));

  if (hit._source) {
    console.log("\nmetadata:", hit._source.metadata);
    console.log("\n=== Parsed text (first 500 chars) ===");
    console.log(hit._source.text.substring(0, 500));

    console.log("\n=== Parsed as JSON ===");
    const parsed = JSON.parse(hit._source.text);
    console.log("Parsed keys:", Object.keys(parsed));
    console.log("Full parsed object:", JSON.stringify(parsed, null, 2));

    console.log("\n=== Raw JSON from metadata (first 500 chars) ===");
    console.log(hit._source.metadata.raw_json.substring(0, 500));

    const rawParsed = JSON.parse(hit._source.metadata.raw_json);
    console.log("\n=== Raw JSON parsed ===");
    console.log("Type:", Array.isArray(rawParsed) ? "Array" : "Object");
    if (Array.isArray(rawParsed)) {
      console.log("Array length:", rawParsed.length);
      console.log("First element keys:", Object.keys(rawParsed[0] || {}));
      console.log("First element:", JSON.stringify(rawParsed[0], null, 2));
    } else {
      console.log("Object keys:", Object.keys(rawParsed));
      console.log("Full object:", JSON.stringify(rawParsed, null, 2));
    }
  }
}

inspectQuestion().catch(console.error);
