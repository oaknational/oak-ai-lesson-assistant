/**
 * Lightweight tracing infrastructure for the Quiz RAG pipeline.
 *
 * Provides automatic timing and metadata collection without requiring
 * OpenTelemetry. Supports pluggable instrumentation strategies for
 * different environments (Sentry breadcrumbs in production, data
 * collection for debug UI).
 */

export interface SpanData {
  [key: string]: unknown;
}

export interface CompletedSpan {
  name: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  data: SpanData;
  children: CompletedSpan[];
}

export interface Span {
  readonly name: string;
  readonly startTime: number;
  setData(key: string, value: unknown): void;
  getData(): SpanData;
  startChild(name: string): Span;
  end(): CompletedSpan;
}

/**
 * Pluggable instrumentation strategy.
 * Implement this to handle span lifecycle events differently
 * in different environments.
 */
export interface InstrumentationStrategy {
  onSpanStart?(span: Span): void;
  onSpanEnd?(span: CompletedSpan): void;
}

export interface TracerOptions {
  instrumentation?: InstrumentationStrategy;
}

export interface Tracer {
  startSpan(name: string): Span;
  getCompletedSpans(): CompletedSpan[];
}

/**
 * Result of creating a report-based streaming instrumentation.
 * The report is updated in-place as spans start/end, and emitted
 * via the iterator after each update.
 */
export interface ReportStreamingInstrumentationResult<TReport> {
  instrumentation: InstrumentationStrategy;
  reportIterator: AsyncIterable<TReport>;
  complete: () => void;
  getReport: () => TReport;
}
