import { mockTracer } from "@oakai/core/src/tracing/mockTracer";

export function expectTracingSpan(operationName: string) {
  return {
    toHaveBeenExecuted: () => {
      expect(
        mockTracer.spans.some(
          (span) => span.tags["operation.name"] === operationName,
        ),
      ).toBeTruthy();
    },
    not: {
      toHaveBeenExecuted: () => {
        expect(
          mockTracer.spans.some(
            (span) => span.tags["operation.name"] === operationName,
          ),
        ).toBeFalsy();
      },
    },
    toHaveBeenExecutedWith: (expectedTags: Record<string, any>) => {
      const span = mockTracer.spans.find(
        (span) => span.tags["operation.name"] === operationName,
      );
      expect(span).toBeTruthy();
      Object.entries(expectedTags).forEach(([key, value]) => {
        expect(span!.tags[key]).toEqual(value);
      });
    },
  };
}
