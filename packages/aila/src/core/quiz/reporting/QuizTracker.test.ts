import type { Span } from "@sentry/nextjs";
import * as Sentry from "@sentry/nextjs";

import { createQuizTracker } from "./QuizTracker";
import type { ReportNode, RootReportNode } from "./Report";

const mockSpan = (name: string) => ({ name }) as unknown as Span;

jest.mock("@sentry/nextjs", () => ({
  startSpan: jest.fn(
    <T>(opts: { name: string }, fn: (span: Span) => T): T =>
      fn(mockSpan(opts.name)),
  ),
}));

// Strip timing fields for snapshot stability
function stripTiming(node: ReportNode): unknown {
  return {
    status: node.status,
    ...(node.error && { error: node.error }),
    ...(Object.keys(node.data).length && { data: node.data }),
    ...(Object.keys(node.children).length && {
      children: Object.fromEntries(
        Object.entries(node.children).map(([k, v]) => [k, stripTiming(v)]),
      ),
    }),
  };
}

describe("QuizTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default implementation
    jest
      .mocked(Sentry.startSpan)
      .mockImplementation((opts, fn) => fn(mockSpan(opts.name)));
  });

  describe("report tree structure", () => {
    it("builds nested children correctly", async () => {
      const tracker = createQuizTracker({});

      await tracker.run(async (task) => {
        await task.child("generator", async (task) => {
          await task.child("query-0", async (task) => {
            task.addData({ query: "test query" });
          });
        });
      });

      const report = tracker.getReport();
      expect(stripTiming(report)).toMatchSnapshot();
    });

    it("handles parallel children", async () => {
      const tracker = createQuizTracker({});

      await tracker.run(async (task) => {
        await Promise.all([
          task.child("a", async () => {}),
          task.child("b", async () => {}),
        ]);
      });

      const report = tracker.getReport();
      expect(Object.keys(report.children)).toEqual(["a", "b"]);
    });

    it("marks error status on failure", async () => {
      const tracker = createQuizTracker({});

      await expect(
        tracker.run(async (task) => {
          await task.child("failing", async () => {
            throw new Error("boom");
          });
        }),
      ).rejects.toThrow("boom");

      const report = tracker.getReport();
      expect(report.children.failing?.status).toBe("error");
      expect(report.children.failing?.error).toBe("boom");
    });
  });

  describe("sentry spans", () => {
    it("creates root span with quiz.pipeline", async () => {
      const tracker = createQuizTracker({});
      await tracker.run(async () => {});

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: "quiz.pipeline", op: "quiz.pipeline" },
        expect.any(Function),
      );
    });

    it("creates child spans with explicit parentSpan", async () => {
      const mockRootSpan = mockSpan("root");
      jest.mocked(Sentry.startSpan).mockImplementation((opts, fn) => {
        if (opts.name === "quiz.pipeline") return fn(mockRootSpan);
        return fn(mockSpan(opts.name));
      });

      const tracker = createQuizTracker({});
      await tracker.run(async (task) => {
        await task.child("myTask", async () => {});
      });

      expect(Sentry.startSpan).toHaveBeenCalledWith(
        { name: "quiz.myTask", op: "quiz.task", parentSpan: mockRootSpan },
        expect.any(Function),
      );
    });
  });

  describe("onUpdate hook", () => {
    it("is called on child start", async () => {
      const updates: RootReportNode[] = [];
      const tracker = createQuizTracker({
        onUpdate: (snapshot) => updates.push(structuredClone(snapshot)),
      });

      await tracker.run(async (task) => {
        await task.child("test", async () => {});
      });

      const startUpdate = updates.find(
        (u) => u.children.test?.status === "running",
      );
      expect(startUpdate).toBeDefined();
    });

    it("is called on child complete", async () => {
      const updates: RootReportNode[] = [];
      const tracker = createQuizTracker({
        onUpdate: (snapshot) => updates.push(structuredClone(snapshot)),
      });

      await tracker.run(async (task) => {
        await task.child("test", async () => {});
      });

      const completeUpdate = updates.find(
        (u) => u.children.test?.status === "complete",
      );
      expect(completeUpdate).toBeDefined();
    });

    it("is called on addData", async () => {
      const updates: RootReportNode[] = [];
      const tracker = createQuizTracker({
        onUpdate: (snapshot) => updates.push(structuredClone(snapshot)),
      });

      await tracker.run(async (task) => {
        task.addData({ foo: "bar" });
      });

      const dataUpdate = updates.find((u) => u.data.foo === "bar");
      expect(dataUpdate).toBeDefined();
    });
  });

  describe("timing", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("records duration on completed tasks", async () => {
      const tracker = createQuizTracker({});

      const promise = tracker.run(async (task) => {
        await task.child("timed", async () => {
          await jest.advanceTimersByTimeAsync(10);
        });
      });

      await promise;

      const report = tracker.getReport();
      expect(report.children.timed?.durationMs).toBe(10);
    });
  });

  describe("reportId", () => {
    it("passes reportId to the callback", async () => {
      const tracker = createQuizTracker({});
      let receivedId: string | undefined;

      await tracker.run(async (task, reportId) => {
        receivedId = reportId;
      });

      expect(receivedId).toBeDefined();
      expect(typeof receivedId).toBe("string");
      expect(receivedId!.length).toBe(16);
    });

    it("includes reportId in the report", async () => {
      const tracker = createQuizTracker({});

      await tracker.run(async () => {});

      const report = tracker.getReport();
      expect(report.reportId).toBeDefined();
      expect(typeof report.reportId).toBe("string");
      expect(report.reportId.length).toBe(16);
    });

    it("callback and report have matching reportId", async () => {
      const tracker = createQuizTracker({});
      let callbackId: string | undefined;

      await tracker.run(async (task, reportId) => {
        callbackId = reportId;
      });

      const report = tracker.getReport();
      expect(callbackId).toBe(report.reportId);
    });
  });
});
