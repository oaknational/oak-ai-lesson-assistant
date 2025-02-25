import { posthogAiBetaServerClient } from "@oakai/core/src/analytics/posthogAiBetaServerClient";

import { ElasticLessonQuizLookup } from "./LessonSlugQuizMapping";

// Mock the posthogAiBetaServerClient
jest.mock("@oakai/core/src/analytics/posthogAiBetaServerClient", () => ({
  posthogAiBetaServerClient: {
    isFeatureEnabled: jest.fn().mockResolvedValue(false),
  },
}));

describe("ElasticLessonQuizLookup", () => {
  let dbLookup: ElasticLessonQuizLookup;

  beforeEach(() => {
    dbLookup = new ElasticLessonQuizLookup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("quiz methods", () => {
    const mockLegacyResponse = {
      hits: {
        hits: [
          {
            _source: {
              text: JSON.stringify({
                starterQuiz: ["q1", "q2"],
                exitQuiz: ["q3", "q4"],
                is_legacy: true,
              }),
            },
          },
        ],
      },
    };

    const mockNonLegacyResponse = {
      hits: {
        hits: [
          {
            _source: {
              text: JSON.stringify({
                starterQuiz: ["q1", "q2"],
                exitQuiz: ["q3", "q4"],
                is_legacy: false,
              }),
            },
          },
        ],
      },
    };

    const placeholderQuizIds = [
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
    ];

    beforeEach(() => {
      // @ts-expect-error - Mock the Elasticsearch client search method
      dbLookup.client = {
        search: jest.fn().mockResolvedValue(mockLegacyResponse),
      };
    });

    describe("getStarterQuiz", () => {
      it("should return starter quiz questions for valid legacy lesson slug", async () => {
        const result = await dbLookup.getStarterQuiz("test-lesson");
        expect(result).toEqual(["q1", "q2"]);
        // @ts-expect-error - Mock the Elasticsearch client search method
        expect(dbLookup.client.search).toHaveBeenCalledWith({
          index: "lesson-slug-lookup",
          query: {
            bool: {
              must: [
                { term: { "metadata.lessonSlug.keyword": "test-lesson" } },
              ],
            },
          },
        });
      });

      it("should return placeholder quiz for non-legacy lesson without userId", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        const result = await dbLookup.getStarterQuiz("test-lesson");
        expect(result).toEqual(placeholderQuizIds);
      });

      it("should return placeholder quiz for non-legacy lesson when feature flag is disabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(false);

        const result = await dbLookup.getStarterQuiz("test-lesson", "user-123");

        expect(posthogAiBetaServerClient.isFeatureEnabled).toHaveBeenCalledWith(
          "non-legacy-quizzes-v0",
          "user-123",
        );
        expect(result).toEqual(placeholderQuizIds);
      });

      it("should return actual quiz for non-legacy lesson when feature flag is enabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(true);

        const result = await dbLookup.getStarterQuiz("test-lesson", "user-123");

        expect(posthogAiBetaServerClient.isFeatureEnabled).toHaveBeenCalledWith(
          "non-legacy-quizzes-v0",
          "user-123",
        );
        expect(result).toEqual(["q1", "q2"]);
      });

      it("should throw error when no quiz found", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        await expect(dbLookup.getStarterQuiz("non-existent")).rejects.toThrow(
          "No /starterQuiz found for lesson slug: non-existent",
        );
      });

      it("should throw error when quiz data is invalid", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({
          hits: {
            hits: [
              {
                _source: {
                  text: JSON.stringify({ starterQuiz: null, is_legacy: true }),
                },
              },
            ],
          },
        });
        await expect(dbLookup.getStarterQuiz("test-lesson")).rejects.toThrow(
          "Invalid /starterQuiz data for lesson slug: test-lesson",
        );
      });
    });

    describe("getExitQuiz", () => {
      it("should return exit quiz questions for valid legacy lesson slug", async () => {
        const result = await dbLookup.getExitQuiz("test-lesson");
        expect(result).toEqual(["q3", "q4"]);
        // @ts-expect-error - Mock the Elasticsearch client search method
        expect(dbLookup.client.search).toHaveBeenCalledWith({
          index: "lesson-slug-lookup",
          query: {
            bool: {
              must: [
                { term: { "metadata.lessonSlug.keyword": "test-lesson" } },
              ],
            },
          },
        });
      });

      it("should return placeholder quiz for non-legacy lesson without userId", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        const result = await dbLookup.getExitQuiz("test-lesson");
        expect(result).toEqual(placeholderQuizIds);
      });

      it("should return placeholder quiz for non-legacy lesson when feature flag is disabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(false);

        const result = await dbLookup.getExitQuiz("test-lesson", "user-123");

        expect(posthogAiBetaServerClient.isFeatureEnabled).toHaveBeenCalledWith(
          "non-legacy-quizzes-v0",
          "user-123",
        );
        expect(result).toEqual(placeholderQuizIds);
      });

      it("should return actual quiz for non-legacy lesson when feature flag is enabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(true);

        const result = await dbLookup.getExitQuiz("test-lesson", "user-123");

        expect(posthogAiBetaServerClient.isFeatureEnabled).toHaveBeenCalledWith(
          "non-legacy-quizzes-v0",
          "user-123",
        );
        expect(result).toEqual(["q3", "q4"]);
      });

      it("should throw error when no quiz found", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        await expect(dbLookup.getExitQuiz("non-existent")).rejects.toThrow(
          "No /exitQuiz found for lesson slug: non-existent",
        );
      });

      it("should throw error when quiz data is invalid", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({
          hits: {
            hits: [
              {
                _source: {
                  text: JSON.stringify({ exitQuiz: null, is_legacy: true }),
                },
              },
            ],
          },
        });
        await expect(dbLookup.getExitQuiz("test-lesson")).rejects.toThrow(
          "Invalid /exitQuiz data for lesson slug: test-lesson",
        );
      });
    });

    describe("hasStarterQuiz", () => {
      it("should return true when starter quiz exists for legacy lesson", async () => {
        const result = await dbLookup.hasStarterQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return true when non-legacy lesson (returns placeholder)", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        const result = await dbLookup.hasStarterQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return true when non-legacy lesson with feature flag enabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(true);

        const result = await dbLookup.hasStarterQuiz("test-lesson", "user-123");
        expect(result).toBe(true);
      });

      it("should return false when starter quiz doesn't exist", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        const result = await dbLookup.hasStarterQuiz("non-existent");
        expect(result).toBe(false);
      });
    });

    describe("hasExitQuiz", () => {
      it("should return true when exit quiz exists for legacy lesson", async () => {
        const result = await dbLookup.hasExitQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return true when non-legacy lesson (returns placeholder)", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        const result = await dbLookup.hasExitQuiz("test-lesson");
        expect(result).toBe(true);
      });

      it("should return true when non-legacy lesson with feature flag enabled", async () => {
        // @ts-expect-error - Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce(mockNonLegacyResponse);
        (
          posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
        ).mockResolvedValueOnce(true);

        const result = await dbLookup.hasExitQuiz("test-lesson", "user-123");
        expect(result).toBe(true);
      });

      it("should return false when exit quiz doesn't exist", async () => {
        // @ts-expect-error- Mock the Elasticsearch client search method
        dbLookup.client.search.mockResolvedValueOnce({ hits: { hits: [] } });
        const result = await dbLookup.hasExitQuiz("non-existent");
        expect(result).toBe(false);
      });
    });
  });
});

describe("Testing feature flags on live legacy lessons", () => {
  it("Should return placeholder quizIds for a non legacy (new) lesson, when the feature flag is disabled", async () => {
    const placeholderQuizIds = [
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
    ];
    const dbLookup = new ElasticLessonQuizLookup();
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(false);
    const starterQuiz = await dbLookup.getStarterQuiz(
      "comparing-multiple-representations-to-calculate-theoretical-probabilities",
      "user-123",
    );
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(false);
    const exitQuiz = await dbLookup.getExitQuiz(
      "comparing-multiple-representations-to-calculate-theoretical-probabilities",
      "user-123",
    );
    expect(starterQuiz).toEqual(placeholderQuizIds);
    expect(exitQuiz).toEqual(placeholderQuizIds);
  });

  it("Should return non placeholder quizIds for a non legacy (new) lesson, when the feature flag is enabled", async () => {
    const dbLookup = new ElasticLessonQuizLookup();
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(true);
    const starterQuiz = await dbLookup.getStarterQuiz(
      "comparing-multiple-representations-to-calculate-theoretical-probabilities",
      "user-123",
    );
    (
      posthogAiBetaServerClient.isFeatureEnabled as jest.Mock
    ).mockResolvedValueOnce(true);
    const exitQuiz = await dbLookup.getExitQuiz(
      "comparing-multiple-representations-to-calculate-theoretical-probabilities",
      "user-123",
    );

    const expectedExitQuiz = [
      "QUES-LUSO2-37461",
      "QUES-DNJM2-37462",
      "QUES-KVSD2-37463",
      "QUES-HPLU2-37464",
      "QUES-MCAK2-37465",
      "QUES-OFCP2-37466",
    ];
    const expectedStarterQuiz = [
      "QUES-EYIT2-37455",
      "QUES-GJWN2-37457",
      "QUES-QUMT2-37458",
      "QUES-MNVZ2-37459",
      "QUES-MDXX2-37460",
    ];
    expect(starterQuiz).toEqual(expectedStarterQuiz);
    expect(exitQuiz).toEqual(expectedExitQuiz);
  });
});

describe("Edge case of legacy lesson", () => {
  it("Should return placeholder quizIds for A legacy lessons that HB has previously tested", async () => {
    const placeholderQuizIds = [
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
    ];
    const dbLookup = new ElasticLessonQuizLookup();
    const result = await dbLookup.getStarterQuiz(
      "finding-the-perimeter-of-polygons",
    );
    expect(result).toEqual(placeholderQuizIds);
  });
});

describe("ElasticLessonQuizLookup integrations tests", () => {
  it("Should pass integration test for starter quiz", async () => {
    const dbLookup = new ElasticLessonQuizLookup();
    const result = await dbLookup.getStarterQuiz(
      "sketching-quadratic-graphs-part-2-61h62d",
    );
    expect(result).toEqual([
      "QUES-EYPJ1-67826",
      "QUES-KBWC1-67827",
      "QUES-SLVS1-67828",
      "QUES-MCWI1-67829",
      "QUES-HJPP1-67830",
    ]);
  });
  it("Should pass integration test for exit quiz", async () => {
    const dbLookup = new ElasticLessonQuizLookup();
    const result = await dbLookup.getExitQuiz(
      "sketching-quadratic-graphs-part-2-61h62d",
    );
    expect(result).toEqual([
      "QUES-FTIZ1-76446",
      "QUES-ITJT1-76447",
      "QUES-YYMU1-76448",
      "QUES-TTEF1-76449",
      "QUES-FRFV1-76452",
    ]);
  });
});

describe("ElasticLessonQuizLookup", () => {
  it("Should return placeholder quizIds for starter quiz where they are missing and filled with placeholders in the elasticDB and real quizIds for exit quiz of legacy lessons", async () => {
    const placeholderQuizIds = [
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
      "QUES-XXXXX-XXXXX",
    ];
    const dbLookup = new ElasticLessonQuizLookup();
    const result = await dbLookup.getStarterQuiz(
      "calculate-and-measure-perimeter-crv36r",
    );
    const result2 = await dbLookup.getExitQuiz(
      "calculate-and-measure-perimeter-crv36r",
    );
    expect(result).toEqual(placeholderQuizIds);
    expect(result2).not.toEqual(placeholderQuizIds);
  });
});
