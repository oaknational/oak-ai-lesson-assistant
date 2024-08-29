import { TracingSpan } from "./serverTracing";

class MockSpan implements TracingSpan {
  tags: Record<string, any> = {};
  setTag(key: string, value: any) {
    this.tags[key] = value;
  }
  finish() {}
}

class MockTracer {
  spans: MockSpan[] = [];

  trace(
    name: string,
    options: any,
    callback: (span: TracingSpan) => Promise<any>,
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
