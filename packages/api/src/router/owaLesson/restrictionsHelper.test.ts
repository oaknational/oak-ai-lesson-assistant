import {
  checkForRestrictedSubject,
  checkForRestrictedWorks,
  checkForRestrictionLevels,
} from "./restrictionsHelper";
import type { TRPCWorksResponse } from "./types";

jest.mock("@oakai/logger", () => ({
  aiLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

const unrestrictedLevels = {
  slug: "a-lesson",
  lesson_id: 1,
  tpc_works_max_restriction: null,
  tpc_media_max_restriction: null,
  features: {},
};

const tcpDataWith = ({
  restrictionLevels = [unrestrictedLevels],
  worksList = [],
}: {
  restrictionLevels?: unknown[];
  worksList?: unknown[];
} = {}) =>
  ({
    data: {
      tcpWorksByLessonSlug: [
        { slug: "a-lesson", lesson_id: 1, works_list: worksList },
      ],
      restrictionLevels,
    },
  }) as TRPCWorksResponse;

describe("checkForRestrictedSubject", () => {
  it("throws for a lesson in an excluded subject", () => {
    expect(() => checkForRestrictedSubject(["music"])).toThrow(
      "restricted-subject",
    );
  });

  it("throws when any of a canonical lesson's subjects is excluded", () => {
    expect(() => checkForRestrictedSubject(["history", "geography"])).toThrow(
      "restricted-subject",
    );
  });

  it("throws for a lesson with no subject", () => {
    expect(() => checkForRestrictedSubject([])).toThrow("restricted-subject");
  });

  it("allows a lesson in a permitted subject", () => {
    expect(() => checkForRestrictedSubject(["english"])).not.toThrow();
  });
});

describe("checkForRestrictionLevels", () => {
  it("returns no restrictions for an unrestricted lesson", () => {
    expect(checkForRestrictionLevels(tcpDataWith())).toEqual([]);
  });

  it("throws for a lesson flagged with a copyright conflict", () => {
    expect(() =>
      checkForRestrictionLevels(
        tcpDataWith({
          restrictionLevels: [
            {
              ...unrestrictedLevels,
              features: { has_copyright_conflict: true },
            },
          ],
        }),
      ),
    ).toThrow("restricted-third-party-content");
  });

  it.each(["Restricted", "Highly restricted"])(
    "throws for a lesson with %s works",
    (level) => {
      expect(() =>
        checkForRestrictionLevels(
          tcpDataWith({
            restrictionLevels: [
              { ...unrestrictedLevels, tpc_works_max_restriction: level },
            ],
          }),
        ),
      ).toThrow("restricted-third-party-content");
    },
  );

  it.each(["Restricted", "Highly restricted"])(
    "allows a lesson with %s media, returning the restriction",
    (level) => {
      expect(
        checkForRestrictionLevels(
          tcpDataWith({
            restrictionLevels: [
              { ...unrestrictedLevels, tpc_media_max_restriction: level },
            ],
          }),
        ),
      ).toEqual(["restricted-media"]);
    },
  );

  it("throws for a lesson with no published restriction levels", () => {
    expect(() =>
      checkForRestrictionLevels(tcpDataWith({ restrictionLevels: [] })),
    ).toThrow("restricted-third-party-content");
  });

  it("throws for restriction levels that fail to parse", () => {
    expect(() =>
      checkForRestrictionLevels(
        tcpDataWith({
          restrictionLevels: [
            { ...unrestrictedLevels, tpc_works_max_restriction: 1 },
          ],
        }),
      ),
    ).toThrow("restricted-third-party-content");
  });

  it("does not use the word 'copyright', which the client handles separately", () => {
    expect(() =>
      checkForRestrictionLevels(tcpDataWith({ restrictionLevels: [] })),
    ).toThrow(/^(?!.*copyright)restricted-third-party-content/);
  });
});

describe("checkForRestrictedWorks", () => {
  it("throws for a lesson with any third-party works", () => {
    expect(() =>
      checkForRestrictedWorks(
        tcpDataWith({ worksList: [{ restriction_level: "Restricted" }] }),
      ),
    ).toThrow("restricted-third-party-content");
  });

  it("allows a lesson with no third-party works", () => {
    expect(checkForRestrictedWorks(tcpDataWith())).toBe(false);
  });
});
