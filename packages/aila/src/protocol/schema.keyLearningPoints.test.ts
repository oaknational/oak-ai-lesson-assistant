import {
  KEY_LEARNING_POINTS_MAX,
  KEY_LEARNING_POINTS_MIN,
  KeyLearningPointsSchema,
  KeyLearningPointsStrictMax4Schema,
} from "./schema";

const points = (count: number) =>
  Array.from({ length: count }, (_, i) => `Key learning point ${i + 1}`);

describe("KeyLearningPointsStrictMax4Schema", () => {
  it("accepts the minimum number of points", () => {
    expect(
      KeyLearningPointsStrictMax4Schema.safeParse(
        points(KEY_LEARNING_POINTS_MIN),
      ).success,
    ).toBe(true);
  });

  it("accepts the maximum number of points", () => {
    expect(
      KeyLearningPointsStrictMax4Schema.safeParse(
        points(KEY_LEARNING_POINTS_MAX),
      ).success,
    ).toBe(true);
  });

  it("rejects fewer points than the minimum", () => {
    expect(
      KeyLearningPointsStrictMax4Schema.safeParse(
        points(KEY_LEARNING_POINTS_MIN - 1),
      ).success,
    ).toBe(false);
  });

  it("rejects more points than the maximum", () => {
    expect(
      KeyLearningPointsStrictMax4Schema.safeParse(
        points(KEY_LEARNING_POINTS_MAX + 1),
      ).success,
    ).toBe(false);
  });
});

// This tests the schema for persisted lesson plans we already hold: lessons
// saved in the database and basedOn/RAG lessons routinely carry more key
// learning points than the LLM is now allowed to produce.
describe("KeyLearningPointsSchema (persisted)", () => {
  it("still accepts ten points", () => {
    expect(KeyLearningPointsSchema.safeParse(points(10)).success).toBe(true);
  });
});
