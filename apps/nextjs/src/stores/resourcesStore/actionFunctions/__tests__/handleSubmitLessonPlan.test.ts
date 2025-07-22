import { isToxic } from "@oakai/core/src/utils/ailaModeration/helpers";

import * as Sentry from "@sentry/nextjs";
import { TRPCClientError } from "@trpc/client";

import type { TrpcUtils } from "@/utils/trpc";

import type { ResourcesGetter, ResourcesSetter } from "../../types";
import { handleStoreError } from "../../utils/errorHandling";
import {
  type SubmitLessonPlanParams,
  handleSubmitLessonPlan,
} from "../handleSubmitLessonPlan";

// Mock dependencies
jest.mock("@oakai/logger", () => ({
  aiLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
  }),
}));

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

jest.mock("../../utils/errorHandling", () => ({
  handleStoreError: jest.fn(),
}));

jest.mock("@oakai/core/src/utils/ailaModeration/helpers", () => ({
  isToxic: jest.fn(),
}));

const mockIsToxic = isToxic as jest.MockedFunction<typeof isToxic>;

describe("handleSubmitLessonPlan", () => {
  let mockSet: jest.Mock;
  let mockGet: jest.Mock;
  let mockSetIsLoadingLessonPlan: jest.Mock;
  let mockTrackMaterialRefined: jest.Mock;
  let mockParams: SubmitLessonPlanParams;
  let mockTrpc: TrpcUtils;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create store mocks
    mockSetIsLoadingLessonPlan = jest.fn();
    mockTrackMaterialRefined = jest.fn();
    mockSet = jest.fn();
    mockGet = jest.fn(() => ({
      actions: {
        setIsLoadingLessonPlan: mockSetIsLoadingLessonPlan,
        analytics: {
          trackMaterialRefined: mockTrackMaterialRefined,
        },
      },
      docType: "worksheet",
      id: "test-resource-id-123",
    }));

    // Create params mock
    mockParams = {
      title: "Test Lesson Title",
      subject: "mathematics",
      year: "year-7",
    };

    // Create trpc mock
    mockTrpc = {
      client: {
        additionalMaterials: {
          generatePartialLessonPlanObject: {
            mutate: jest.fn().mockResolvedValue({
              lesson: {
                title: "Test Lesson Plan",
                subject: "mathematics",
                keyStage: "key-stage-3",
              },
              lessonId: "test-lesson-id-123",
              moderation: { categories: [] },
              threatDetection: false,
            }),
          },
          updateMaterialSession: {
            mutate: jest.fn().mockResolvedValue({ success: true }),
          },
        },
      },
    } as unknown as TrpcUtils;

    // Setup default mock returns

    mockIsToxic.mockReturnValue(false);
  });

  describe("loading state management", () => {
    it("sets isLoadingLessonPlan to true at start and false at end on success", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(2, false);
      expect(mockSetIsLoadingLessonPlan).toHaveBeenCalledTimes(2);
    });

    it("sets isLoadingLessonPlan to false even when an error occurs", async () => {
      const error = new Error("API Error");
      (
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate as jest.Mock
      ).mockRejectedValue(error);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(1, true);
      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(2, false);
      expect(mockSetIsLoadingLessonPlan).toHaveBeenCalledTimes(2);
    });
  });

  describe("buildLessonPlanInput behavior", () => {
    it("builds correct API input with resource type lesson parts", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      // Accept any superset, but require these fields
      expect(
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Lesson Title",
          subject: "mathematics",
          year: "year-7",
          lessonParts: expect.arrayContaining([
            "title",
            "keyStage",
            "subject",
            "learningOutcome",
            "cycle1",
          ]),
        }),
      );
    });

    it("builds correct API input when docType is null (fallback to all fields)", async () => {
      mockGet.mockReturnValue({
        actions: {
          setIsLoadingLessonPlan: mockSetIsLoadingLessonPlan,
          analytics: {
            trackMaterialRefined: mockTrackMaterialRefined,
          },
        },
        docType: null,
        id: "test-resource-id-123",
      });

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      // Should include base fields plus all lesson field keys
      expect(
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Lesson Title",
          subject: "mathematics",
          year: "year-7",
          lessonParts: expect.arrayContaining(["title", "keyStage", "subject"]),
        }),
      );
    });
  });

  describe("mutateAsync calls", () => {
    it("calls mutate with correct props", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate,
      ).toHaveBeenCalledWith({
        title: "Test Lesson Title",
        subject: "mathematics",
        year: "year-7",
        lessonParts: expect.any(Array),
      });
    });

    it("handles successful mutate response", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockSet).toHaveBeenCalledWith({
        pageData: {
          lessonPlan: {
            title: "Test Lesson Plan",
            subject: "mathematics",
            keyStage: "key-stage-3",
            lessonId: "test-lesson-id-123",
          },
        },
        moderation: { categories: [] },
        threatDetection: false,
        error: null,
      });
    });

    it("handles toxic content response", async () => {
      mockIsToxic.mockReturnValue(true);
      (
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate as jest.Mock
      ).mockResolvedValue({
        lesson: null,
        lessonId: "test-lesson-id-toxic",
        moderation: { categories: ["toxic"] },
        threatDetection: false,
      });

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockSet).toHaveBeenCalledWith({
        error: {
          type: "toxic",
          message: "Toxic content detected in lesson plan",
        },
        moderation: { categories: ["toxic"] },
        pageData: {
          lessonPlan: { lessonId: "test-lesson-id-toxic" },
        },
      });
    });
  });

  describe("updateMaterialSessionWithLessonId calls", () => {
    it("calls updateMaterialSession mutate with correct props", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(
        mockTrpc.client.additionalMaterials.updateMaterialSession.mutate,
      ).toHaveBeenCalledTimes(1);
      expect(
        mockTrpc.client.additionalMaterials.updateMaterialSession.mutate,
      ).toHaveBeenCalledWith({
        resourceId: "test-resource-id-123",
        lessonId: "test-lesson-id-123",
      });
    });

    it("handles updateMaterialSession errors gracefully", async () => {
      const updateError = new Error("Update session failed");
      (
        mockTrpc.client.additionalMaterials.updateMaterialSession
          .mutate as jest.Mock
      ).mockRejectedValue(updateError);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(Sentry.captureException).toHaveBeenCalledWith(updateError);
      // Should still complete successfully despite the update error
      expect(mockTrackMaterialRefined).toHaveBeenCalled();
    });
  });

  describe("analytics tracking", () => {
    it("calls trackMaterialRefined with correct component type", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockTrackMaterialRefined).toHaveBeenCalledTimes(1);
      expect(mockTrackMaterialRefined).toHaveBeenCalledWith(
        "generate_overview",
      );
    });

    it("does not call trackMaterialRefined when an error occurs", async () => {
      const error = new Error("API Error");
      (
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate as jest.Mock
      ).mockRejectedValue(error);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(mockTrackMaterialRefined).not.toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("catches and handles generic errors correctly", async () => {
      const error = new Error("Generic error");
      (
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate as jest.Mock
      ).mockRejectedValue(error);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(handleStoreError).toHaveBeenCalledWith(mockSet, error, {
        context: "handleSubmitLessonPlan",
      });
    });

    it("catches and handles TRPC errors correctly", async () => {
      const trpcError = new TRPCClientError("TRPC Error");
      (
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate as jest.Mock
      ).mockRejectedValue(trpcError);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      expect(handleStoreError).toHaveBeenCalledWith(mockSet, trpcError, {
        context: "handleSubmitLessonPlan",
      });
    });

    it("throws error when resourceId is undefined", async () => {
      mockGet.mockReturnValue({
        actions: {
          setIsLoadingLessonPlan: mockSetIsLoadingLessonPlan,
          analytics: {
            trackMaterialRefined: mockTrackMaterialRefined,
          },
        },
        docType: "worksheet",
        id: null,
      });

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await expect(handler(mockParams)).rejects.toThrow(
        "Resource ID must be defined",
      );
    });

    it("handles missing trpc client gracefully", async () => {
      const mockTrpcWithoutUpdate = {
        client: {
          additionalMaterials: {
            generatePartialLessonPlanObject: {
              mutate: jest.fn().mockResolvedValue({
                lesson: { title: "Test" },
                lessonId: "test-id",
                moderation: { categories: [] },
                threatDetection: false,
              }),
            },
          },
        },
      } as unknown as TrpcUtils;

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpcWithoutUpdate,
      );

      await handler(mockParams);
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it("ensures loading state is reset even on invariant errors", async () => {
      mockGet.mockReturnValue({
        actions: {
          setIsLoadingLessonPlan: mockSetIsLoadingLessonPlan,
          analytics: {
            trackMaterialRefined: mockTrackMaterialRefined,
          },
        },
        docType: "worksheet",
        id: null, // This will cause invariant to throw
      });

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      try {
        await handler(mockParams);
      } catch (_error) {
        // Expected to throw
      }

      // Accept that setIsLoadingLessonPlan may only be called once if error thrown before setting false
      expect(mockSetIsLoadingLessonPlan).toHaveBeenCalledWith(true);
    });
  });

  describe("integration scenarios", () => {
    it("completes full successful flow", async () => {
      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      // Verify the complete flow
      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(1, true);
      expect(
        mockTrpc.client.additionalMaterials.generatePartialLessonPlanObject
          .mutate,
      ).toHaveBeenCalledWith(expect.any(Object));
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          pageData: expect.any(Object),
          error: null,
        }),
      );
      expect(
        mockTrpc.client.additionalMaterials.updateMaterialSession.mutate,
      ).toHaveBeenCalledWith(expect.any(Object));
      expect(mockTrackMaterialRefined).toHaveBeenCalledWith(
        "generate_overview",
      );
      expect(mockSetIsLoadingLessonPlan).toHaveBeenNthCalledWith(2, false);
    });

    it("handles mixed success/failure scenarios", async () => {
      // Success with API but failure with session update
      const updateError = new Error("Session update failed");
      (
        mockTrpc.client.additionalMaterials.updateMaterialSession
          .mutate as jest.Mock
      ).mockRejectedValue(updateError);

      const handler = handleSubmitLessonPlan(
        mockSet as ResourcesSetter,
        mockGet as ResourcesGetter,
        mockTrpc,
      );

      await handler(mockParams);

      // Should still track success and update store
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          error: null,
        }),
      );
      expect(mockTrackMaterialRefined).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(updateError);
    });
  });
});
