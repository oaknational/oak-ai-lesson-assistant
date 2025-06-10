import * as Sentry from "@sentry/nextjs";

export type TracingSpan = Sentry.Span;

export const startSpan = async <T>(
  name: string,
  options: { op?: string } & Record<string, string | number | boolean | undefined>,
  handler: (span: TracingSpan) => Promise<T>,
) => {
  const { op, ...attributes } = options;
  return await Sentry.startSpan({ name, op, attributes }, handler);
};
