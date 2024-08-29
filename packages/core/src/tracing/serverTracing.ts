import { Context } from "@opentelemetry/api";
import {
  InMemorySpanExporter,
  Span,
  SpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import invariant from "tiny-invariant";

import {
  createExporter,
  createResource,
  createSpanProcessor,
  isTest,
  isLocalDev,
} from "./baseTracing";

class LoggingSpanProcessor implements SpanProcessor {
  private originalProcessor: SpanProcessor;

  constructor(originalProcessor: SpanProcessor) {
    this.originalProcessor = originalProcessor;
  }

  onStart(span: Span, parentContext: Context): void {
    this.originalProcessor.onStart(span, parentContext);
    console.log(`Span started: ${span.name}`);
  }

  onEnd(span: Span): void {
    console.log(`Span ended: ${span.name}`);
    try {
      const context = span.spanContext();
      console.log(
        "Span details:",
        JSON.stringify({
          name: span.name,
          spanId: context.spanId,
          traceId: context.traceId,
          parentSpanId: span.parentSpanId,
          startTime: span.startTime,
          endTime: span.endTime,
          status: span.status,
          attributes: span.attributes,
        }),
      );
    } catch (error) {
      console.error(`Error logging span ${span.name}:`, error);
    }
    this.originalProcessor.onEnd(span);
  }

  shutdown(): Promise<void> {
    return this.originalProcessor.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.originalProcessor.forceFlush();
  }
}

const resource = createResource("ai-beta-backend");
const provider = new NodeTracerProvider({ resource });

export const exporter = createExporter(true);
const originalSpanProcessor = createSpanProcessor(true, exporter);
const loggingSpanProcessor = new LoggingSpanProcessor(originalSpanProcessor);

provider.addSpanProcessor(loggingSpanProcessor);
provider.register();

console.log("Server tracing provider initialized. Is test:", isTest);

export const tracer = provider.getTracer("ai-beta-backend");

// Used in tests to get the spans - this will only apply if the exporter is an InMemorySpanExporter
export function tracingSpans() {
  invariant(exporter, "Exporter not initialized");

  const inMemoryExporter = exporter as InMemorySpanExporter;

  if (!(exporter instanceof InMemorySpanExporter)) {
    throw new Error("Exporter is not an InMemorySpanExporter");
  }

  const spans = inMemoryExporter.getFinishedSpans();
  return spans;
}

export function logTracingSpans() {
  const spans = tracingSpans();

  console.log(
    "Spans:",
    spans.map((span) => ({
      name: span.name,
      attributes: span.attributes,
      startTime: span.startTime,
      endTime: span.endTime,
      duration: span.duration,
      status: span.status,
    })),
  );
}

if (isLocalDev) {
  const testSpan = tracer.startSpan("server-test-span");
  testSpan.setAttribute("test-attribute", "server-test-value");
  testSpan.end();

  console.log("Server test span created and ended");
}
