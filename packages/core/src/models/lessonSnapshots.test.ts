import crypto from "crypto";

import type { Snapshot } from "./lessonSnapshots";
import { getSnapshotHash } from "./lessonSnapshots";

const snapshot: Snapshot = { title: "Photosynthesis" };

describe("getSnapshotHash", () => {
  it("no cacheKeyInput keeps the original hash", () => {
    const expected = crypto
      .createHash("sha256")
      .update(JSON.stringify(snapshot))
      .digest("hex");

    expect(getSnapshotHash(snapshot)).toBe(expected);
    expect(getSnapshotHash(snapshot, undefined)).toBe(expected);
  });

  it("deterministic for the same inputs", () => {
    expect(getSnapshotHash(snapshot, "key")).toBe(
      getSnapshotHash(snapshot, "key"),
    );
  });

  it("with vs without cacheKeyInput differ", () => {
    expect(getSnapshotHash(snapshot, "key")).not.toBe(
      getSnapshotHash(snapshot),
    );
  });

  it("different cacheKeyInputs produce different hashes", () => {
    expect(getSnapshotHash(snapshot, "key-a")).not.toBe(
      getSnapshotHash(snapshot, "key-b"),
    );
  });
});
