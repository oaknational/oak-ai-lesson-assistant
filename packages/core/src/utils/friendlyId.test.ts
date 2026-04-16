import { generateFriendlyId } from "./friendlyId";

describe("generateFriendlyId", () => {
  it("returns a friendly ID with fid- prefix", () => {
    const friendlyId = generateFriendlyId("user_abc123");
    expect(friendlyId).toBe("fid-excited-olive-hedgehog");
  });

  it("returns consistent friendly ID for the same input", () => {
    const id1 = generateFriendlyId("user_abc123");
    const id2 = generateFriendlyId("user_abc123");
    expect(id1).toBe("fid-excited-olive-hedgehog");
    expect(id2).toBe("fid-excited-olive-hedgehog");
  });

  it("returns different friendly IDs for different inputs", () => {
    const id1 = generateFriendlyId("user_abc");
    const id2 = generateFriendlyId("user_xyz");
    expect(id1).toBe("fid-close-aqua-bandicoot");
    expect(id2).toBe("fid-old-cyan-chinchilla");
  });

  it("generates different friendly IDs for inputs that would collide with naive seeding", () => {
    // unique-names-generator's seed algorithm sums charCodeAt(i) * 10,
    // which means "ac" and "bb" produce the same seed (both sum to 196*10).
    // These two IDs would collide with the library's built-in string seeding.
    const friendlyId1 = generateFriendlyId("user_test_ac");
    const friendlyId2 = generateFriendlyId("user_test_bb");

    expect(friendlyId1).not.toBe(friendlyId2);
  });
});
