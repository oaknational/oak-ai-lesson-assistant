import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource, ResourceAttributes } from "@opentelemetry/resources";
import {
  SimpleSpanProcessor,
  BatchSpanProcessor,
  InMemorySpanExporter,
  NoopSpanProcessor,
} from "@opentelemetry/sdk-trace-base";

export const isTest = process.env.NODE_ENV === "test";
export const isLocalDev = process.env.NODE_ENV === "development";
export const telemetryEnabled =
  isTest ?? process.env.TELEMETRY_ENABLED === "true";
export const environment =
  process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production";

export function createExporter(isServer: boolean) {
  if (!telemetryEnabled) {
    return null;
  }
  if (isTest) {
    return new InMemorySpanExporter();
  }
  if (isLocalDev) {
    return new OTLPTraceExporter({
      url: "http://localhost:4318/v1/traces", // SigNoz default endpoint
      headers: {}, // Add any headers if required by your SigNoz setup
    });
  }
  return new OTLPTraceExporter({
    url: isServer
      ? "https://trace.agent.datadoghq.com/api/v2/traces"
      : "/api/telemetry",
    headers: isServer ? { "DD-API-KEY": process.env.DATADOG_API_KEY } : {},
  });
}

export function createResource(serviceName: string) {
  return new Resource({
    "service.name": serviceName,
    "service.namespace": "ai-beta",
    "deployment.environment": environment,
  } as ResourceAttributes);
}

export function createSpanProcessor(
  isServer: boolean,
  exporter: OTLPTraceExporter | InMemorySpanExporter | null,
) {
  if (!telemetryEnabled || !exporter) {
    return new NoopSpanProcessor();
  }
  if (isTest || !isServer) {
    return new SimpleSpanProcessor(exporter);
  }
  return new BatchSpanProcessor(exporter);
}
