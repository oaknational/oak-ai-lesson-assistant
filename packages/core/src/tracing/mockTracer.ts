import type { TracingSpan } from "./serverTracing";

class MockSpan implements TracingSpan {
  tags: Record<string, string | number | boolean | undefined> = {};
  setTag(key: string, value: string | number | boolean | undefined) {
    this.tags[key] = value;
  }
  finish() {}
}

class MockTracer {
  spans: MockSpan[] = [];

  trace(
    name: string,
    options: Record<string, string | number>,
    callback: (span: TracingSpan) => Promise<unknown>,
  ) {
    const span = new MockSpan();
    span.setTag("operation.name", name);
    Object.entries(options).forEach(([key, value]) => {
      span.setTag(key, value);
    });
    this.spans.push(span);
    return callback(span);
  }

  reset() {
    this.spans = [];
  }
}

export const mockTracer = new MockTracer();
