// Run by dataCollection.test.ts in an isolated Node process. All data is
// synthetic and the transport only collects envelopes in memory.
import { httpHeadersToSpanAttributes } from "@sentry/core";
import * as Sentry from "@sentry/node";
import assert from "node:assert/strict";

import { sentryDataCollection } from "../dataCollection.ts";

const envelopes = [];
Sentry.init({
  dsn: "https://test@example.invalid/1",
  dataCollection: sentryDataCollection,
  tracesSampleRate: 1,
  defaultIntegrations: false,
  integrations: [Sentry.requestDataIntegration(), Sentry.vercelAIIntegration()],
  transport: () => ({
    send: async (envelope) => {
      envelopes.push(envelope);
      return { statusCode: 200 };
    },
    flush: async () => true,
  }),
});

try {
  const policy = Sentry.getClient().getDataCollectionOptions();
  // Check the SDK's resolved policy: omitted options can enable collection.
  for (const category of [
    "userInfo",
    "cookies",
    "databaseQueryData",
    "queues",
    "stackFrameVariables",
  ]) {
    assert.equal(policy[category], false, category);
  }
  assert.deepEqual(policy.httpBodies, []);
  assert.deepEqual(policy.genAI, { inputs: false, outputs: false });
  assert.deepEqual(policy.mcp, { inputs: false, outputs: false });
  assert.deepEqual(policy.graphQL, { document: false, variables: false });

  const headers = {
    authorization: "PRIVATE_AUTH",
    cookie: "session=PRIVATE_COOKIE",
    "x-forwarded-for": "PRIVATE_IP",
    "x-real-ip": "PRIVATE_IP",
    "x-vercel-ip-city": "PRIVATE_CITY",
    "x-user-email": "PRIVATE_EMAIL",
    "content-type": "application/json",
  };
  Sentry.withScope((scope) => {
    scope.setUser({ id: "synthetic-user-id" });
    scope.setSDKProcessingMetadata({
      ipAddress: "192.0.2.1",
      normalizedRequest: {
        method: "GET",
        url: "https://example.test/?email=PRIVATE_EMAIL&token=PRIVATE_TOKEN&page=2",
        headers,
      },
    });
    Sentry.captureException(new Error("Synthetic privacy regression check"));
  });

  const responseAttributes = httpHeadersToSpanAttributes(
    { ...headers, "set-cookie": "session=PRIVATE_RESPONSE_COOKIE" },
    policy,
    "response",
  );
  assert(!JSON.stringify(responseAttributes).includes("PRIVATE_"));
  assert.deepEqual(responseAttributes["http.response.header.content-type"], [
    "application/json",
  ]);

  // Import after Sentry initialization so the real AI diagnostics channel
  // subscription sees the generation. The model never makes a network call.
  const { generateText } = await import("ai");
  const { MockLanguageModelV4 } = await import("ai/test");
  await Sentry.startSpan({ name: "privacy-generation" }, async () => {
    const result = await generateText({
      model: new MockLanguageModelV4({
        doGenerate: {
          content: [{ type: "text", text: "PRIVATE_AI_OUTPUT" }],
          finishReason: { unified: "stop", raw: undefined },
          usage: { inputTokens: { total: 1 }, outputTokens: { total: 1 } },
          warnings: [],
        },
      }),
      prompt: "PRIVATE_AI_PROMPT",
    });
    assert.equal(result.text, "PRIVATE_AI_OUTPUT");
  });
  await Sentry.flush(3_000);

  const payloads = envelopes.flatMap((envelope) =>
    envelope[1].map((item) => item[1]),
  );
  const error = payloads.find((payload) => payload.exception);
  assert(error, "The test must capture an error, not silently disable Sentry");
  assert.equal(error.user.id, "synthetic-user-id");
  assert.equal(error.user.ip_address, undefined);
  assert.equal(error.request.cookies, undefined);
  assert.equal(error.request.data, undefined);
  assert.equal(error.request.headers["content-type"], "application/json");
  assert(error.request.url.includes("page=2"));

  const spans = payloads.flatMap((payload) => payload.items ?? []);
  assert(
    spans.some((span) =>
      (span.attributes?.["sentry.op"]?.value ?? "").startsWith("gen_ai."),
    ),
    "The test must capture AI spans to prove prompt/output filtering",
  );
  assert(!JSON.stringify(envelopes).includes("PRIVATE_"));
  console.log(
    JSON.stringify({
      errorCaptured: true,
      aiSpansCaptured: true,
      privateDataCaptured: false,
    }),
  );
} finally {
  await Sentry.close(1_000);
}
