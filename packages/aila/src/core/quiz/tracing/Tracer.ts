import type {
  CompletedSpan,
  InstrumentationStrategy,
  Span,
  SpanData,
  Tracer,
  TracerOptions,
} from "./types";

class SpanImpl implements Span {
  readonly name: string;
  readonly startTime: number;
  private data: SpanData = {};
  private children: CompletedSpan[] = [];
  private instrumentation?: InstrumentationStrategy;
  private ended = false;

  constructor(name: string, instrumentation?: InstrumentationStrategy) {
    this.name = name;
    this.startTime = Date.now();
    this.instrumentation = instrumentation;
    this.instrumentation?.onSpanStart?.(this);
  }

  setData(key: string, value: unknown): void {
    if (this.ended) {
      return;
    }
    this.data[key] = value;
  }

  getData(): SpanData {
    return { ...this.data };
  }

  startChild(name: string): Span {
    const child = new SpanImpl(name, this.instrumentation);
    // Track the child - we'll collect its completed form when it ends
    const originalEnd = child.end.bind(child);
    child.end = (): CompletedSpan => {
      const completed = originalEnd();
      this.children.push(completed);
      return completed;
    };
    return child;
  }

  end(): CompletedSpan {
    if (this.ended) {
      // Return a snapshot if already ended
      return {
        name: this.name,
        startTime: this.startTime,
        endTime: this.startTime,
        durationMs: 0,
        data: this.data,
        children: this.children,
      };
    }

    this.ended = true;
    const endTime = Date.now();
    const completed: CompletedSpan = {
      name: this.name,
      startTime: this.startTime,
      endTime,
      durationMs: endTime - this.startTime,
      data: this.data,
      children: this.children,
    };

    this.instrumentation?.onSpanEnd?.(completed);
    return completed;
  }
}

class TracerImpl implements Tracer {
  private completedSpans: CompletedSpan[] = [];
  private instrumentation?: InstrumentationStrategy;

  constructor(options?: TracerOptions) {
    this.instrumentation = options?.instrumentation;
  }

  startSpan(name: string): Span {
    const span = new SpanImpl(name, this.instrumentation);

    // Track root-level spans when they complete
    const originalEnd = span.end.bind(span);
    (span as SpanImpl).end = (): CompletedSpan => {
      const completed = originalEnd();
      this.completedSpans.push(completed);
      return completed;
    };

    return span;
  }

  getCompletedSpans(): CompletedSpan[] {
    return [...this.completedSpans];
  }
}

export function createTracer(options?: TracerOptions): Tracer {
  return new TracerImpl(options);
}
