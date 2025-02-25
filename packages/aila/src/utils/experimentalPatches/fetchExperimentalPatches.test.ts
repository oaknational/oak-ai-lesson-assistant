import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";

import type { FullQuizService } from "../../core/quiz/interfaces";
import type {
  ExperimentalPatchDocument,
  PatchDocument,
} from "../../protocol/jsonPatchProtocol";
import type { LooseLessonPlan } from "../../protocol/schema";
import { fetchExperimentalPatches } from "./fetchExperimentalPatches";
import { mathsQuizFixture } from "./mathsQuiz.fixture";

// Mock the posthogAiBetaServerClient
jest.mock("@oakai/core/src/analytics/posthogAiBetaServerClient", () => ({
  posthogAiBetaServerClient: {
    isFeatureEnabled: jest.fn().mockResolvedValue(false),
  },
}));

describe("fetchExperimentalPatches", () => {
  // Mock the fullQuizService
  const mockFullQuizService: jest.Mocked<FullQuizService> = {
    createBestQuiz: jest.fn().mockResolvedValue(mathsQuizFixture),
    quizSelector: {} as any,
    quizReranker: {} as any,
    quizGenerators: [] as any,
  };

  // Mock the handlePatch function
  const mockHandlePatch = jest.fn().mockResolvedValue(undefined);

  // Sample lesson plan
  const sampleLessonPlan: LooseLessonPlan = {
    title: "Test Lesson",
    subject: "maths",
    keyLearningPoints: ["point1", "point2"],
  };

  // Sample patches
  const samplePatches: PatchDocument[] = [
    {
      type: "patch",
      reasoning: "test reasoning",
      value: {
        op: "add",
        path: "/starterQuiz",
        value: mathsQuizFixture,
      },
    },
    {
      type: "patch",
      reasoning: "test reasoning",
      value: {
        op: "add",
        path: "/exitQuiz",
        value: mathsQuizFixture,
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not fetch experimental patches for non-maths subjects", async () => {
    const nonMathsLessonPlan = { ...sampleLessonPlan, subject: "english" };

    await fetchExperimentalPatches({
      lessonPlan: nonMathsLessonPlan,
      llmPatches: samplePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: "test-user-123",
    });

    expect(mockHandlePatch).not.toHaveBeenCalled();
    expect(mockFullQuizService.createBestQuiz).not.toHaveBeenCalled();
  });

  it("should not fetch experimental patches when userId is not provided", async () => {
    await fetchExperimentalPatches({
      lessonPlan: sampleLessonPlan,
      llmPatches: samplePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: undefined,
    });

    expect(mockHandlePatch).not.toHaveBeenCalled();
    expect(mockFullQuizService.createBestQuiz).not.toHaveBeenCalled();
  });

  it("should not fetch experimental patches when feature flag is disabled", async () => {
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(false);

    await fetchExperimentalPatches({
      lessonPlan: sampleLessonPlan,
      llmPatches: samplePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: "test-user-123",
    });

    expect(posthogAiBetaServerClient.isFeatureEnabled).toHaveBeenCalledWith(
      "maths-quiz-v0",
      "test-user-123",
    );
    expect(mockHandlePatch).not.toHaveBeenCalled();
    expect(mockFullQuizService.createBestQuiz).not.toHaveBeenCalled();
  });

  it("should pass userId to fullQuizService.createBestQuiz for starter quiz", async () => {
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(true);

    await fetchExperimentalPatches({
      lessonPlan: sampleLessonPlan,
      llmPatches: samplePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: "test-user-123",
    });

    expect(mockFullQuizService.createBestQuiz).toHaveBeenCalledWith(
      "/starterQuiz",
      sampleLessonPlan,
      undefined,
      "test-user-123",
    );
    expect(mockHandlePatch).toHaveBeenCalled();
  });

  it("should pass userId to fullQuizService.createBestQuiz for exit quiz", async () => {
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(true);

    await fetchExperimentalPatches({
      lessonPlan: sampleLessonPlan,
      llmPatches: samplePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: "test-user-123",
    });

    expect(mockFullQuizService.createBestQuiz).toHaveBeenCalledWith(
      "/exitQuiz",
      sampleLessonPlan,
      undefined,
      "test-user-123",
    );
    expect(mockHandlePatch).toHaveBeenCalled();
  });

  it("should handle remove operations for quizzes", async () => {
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(true);

    const removePatches: PatchDocument[] = [
      {
        type: "patch",
        reasoning: "test reasoning",
        value: {
          op: "remove",
          path: "/starterQuiz",
        },
      },
      {
        type: "patch",
        reasoning: "test reasoning",
        value: {
          op: "remove",
          path: "/exitQuiz",
        },
      },
    ];

    await fetchExperimentalPatches({
      lessonPlan: sampleLessonPlan,
      llmPatches: removePatches,
      handlePatch: mockHandlePatch,
      fullQuizService: mockFullQuizService,
      userId: "test-user-123",
    });

    // Should not call createBestQuiz for remove operations
    expect(mockFullQuizService.createBestQuiz).not.toHaveBeenCalled();

    // Should call handlePatch with remove operations
    expect(mockHandlePatch).toHaveBeenCalledTimes(2);
    expect(mockHandlePatch).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expect.objectContaining({
          op: "remove",
          path: "/_experimental_starterQuizMathsV0",
        }),
      }),
    );
    expect(mockHandlePatch).toHaveBeenCalledWith(
      expect.objectContaining({
        value: expect.objectContaining({
          op: "remove",
          path: "/_experimental_exitQuizMathsV0",
        }),
      }),
    );
  });
});
