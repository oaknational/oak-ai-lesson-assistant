import {
  LESSON_RESTRICTIONS_CONFIG,
  getLessonRestrictions,
  isSubjectExcluded,
  shouldExcludeLesson,
  shouldExcludeTranscript,
} from "./lessonRestrictions";

const unrestricted = {
  tpcWorksMaxRestriction: null,
  tpcMediaMaxRestriction: null,
  features: null,
};

describe("getLessonRestrictions", () => {
  it.each([
    // lesson_assets_1's old copyright key is not one we look for
    [{ agf__has_copyright_restrictions: true }],
    [{ agf__restricted_download: true, agf__geo_restricted: true }],
    [{}],
    [null],
    [undefined],
  ])("does not flag features without the copyright flag (%j)", (features) => {
    expect(getLessonRestrictions({ ...unrestricted, features })).toEqual([]);
  });

  // Matches the data team's `_has_key` query: a conflict is the key being present
  it.each([[true], ["a conflict description"], [{ works: [1] }], [[]], [null]])(
    "flags a lesson whose features have a copyright conflict (%j)",
    (value) => {
      expect(
        getLessonRestrictions({
          ...unrestricted,
          features: { has_copyright_conflict: value },
        }),
      ).toEqual(["copyright-feature"]);
    },
  );

  it("does not flag a copyright conflict explicitly set to false", () => {
    expect(
      getLessonRestrictions({
        ...unrestricted,
        features: { has_copyright_conflict: false },
      }),
    ).toEqual([]);
  });

  it.each(["Restricted", "Highly restricted"])("flags %s works", (level) => {
    expect(
      getLessonRestrictions({ ...unrestricted, tpcWorksMaxRestriction: level }),
    ).toEqual(["restricted-works"]);
  });

  it.each(["Restricted", "Highly restricted"])("flags %s media", (level) => {
    expect(
      getLessonRestrictions({ ...unrestricted, tpcMediaMaxRestriction: level }),
    ).toEqual(["restricted-media"]);
  });

  it.each(["highly restricted", "RESTRICTED", " Restricted "])(
    "flags %s regardless of case and whitespace",
    (level) => {
      expect(
        getLessonRestrictions({
          ...unrestricted,
          tpcWorksMaxRestriction: level,
          tpcMediaMaxRestriction: level,
        }),
      ).toEqual(["restricted-works", "restricted-media"]);
    },
  );

  it("matches config levels written in any case", () => {
    expect(
      getLessonRestrictions(
        { ...unrestricted, tpcWorksMaxRestriction: "Highly restricted" },
        {
          ...LESSON_RESTRICTIONS_CONFIG,
          tpcLevelsTreatedAsRestricted: new Set(["HIGHLY RESTRICTED"]),
        },
      ),
    ).toEqual(["restricted-works"]);
  });

  it.each(["OGL compatible", "OGL equivalent", null, undefined])(
    "flags nothing for OGL and absent restrictions (%s)",
    (level) => {
      expect(
        getLessonRestrictions({
          ...unrestricted,
          tpcWorksMaxRestriction: level,
          tpcMediaMaxRestriction: level,
        }),
      ).toEqual([]);
    },
  );

  it("records every restriction that applies", () => {
    expect(
      getLessonRestrictions({
        tpcWorksMaxRestriction: "Restricted",
        tpcMediaMaxRestriction: "Highly restricted",
        features: { has_copyright_conflict: true },
      }),
    ).toEqual(["restricted-works", "restricted-media", "copyright-feature"]);
  });

  it("flags missing restriction data when the lesson has no restriction levels row", () => {
    expect(getLessonRestrictions(undefined)).toEqual([
      "missing-restriction-data",
    ]);
  });
});

describe("isSubjectExcluded", () => {
  it.each([
    "art",
    "french",
    "geography",
    "german",
    "music",
    "religious-education",
    "spanish",
  ])("excludes %s", (subjectSlug) => {
    expect(isSubjectExcluded(subjectSlug)).toBe(true);
  });

  it.each(["english", "history", "maths", "design-technology"])(
    "does not exclude %s",
    (subjectSlug) => {
      expect(isSubjectExcluded(subjectSlug)).toBe(false);
    },
  );
});

describe("shouldExcludeLesson", () => {
  it.each([
    ["copyright-feature"],
    ["missing-restriction-data"],
    ["restricted-works"],
  ] as const)("excludes a lesson with %s", (restriction) => {
    expect(shouldExcludeLesson([restriction])).toBe(true);
  });

  it("keeps a lesson whose only restriction is its media", () => {
    expect(shouldExcludeLesson(["restricted-media"])).toBe(false);
  });

  it("keeps an unrestricted lesson", () => {
    expect(shouldExcludeLesson([])).toBe(false);
  });
});

describe("shouldExcludeTranscript", () => {
  it("excludes the transcript of a lesson with restricted media", () => {
    expect(
      shouldExcludeTranscript({
        restrictions: ["restricted-media"],
        subjectSlugs: ["history"],
      }),
    ).toBe(true);
  });

  it("excludes every English transcript", () => {
    expect(
      shouldExcludeTranscript({ restrictions: [], subjectSlugs: ["english"] }),
    ).toBe(true);
  });

  it("excludes the transcript of a lesson with restricted media and no subject", () => {
    expect(
      shouldExcludeTranscript({
        restrictions: ["restricted-media"],
        subjectSlugs: [],
      }),
    ).toBe(true);
  });

  it("excludes the transcript of a lesson with no subject", () => {
    expect(
      shouldExcludeTranscript({ restrictions: [], subjectSlugs: [] }),
    ).toBe(true);
  });

  it("excludes the transcript when any of a lesson's subjects is English", () => {
    expect(
      shouldExcludeTranscript({
        restrictions: [],
        subjectSlugs: ["history", "english"],
      }),
    ).toBe(true);
  });

  it("keeps the transcript of an unrestricted lesson", () => {
    expect(
      shouldExcludeTranscript({ restrictions: [], subjectSlugs: ["history"] }),
    ).toBe(false);
  });
});
