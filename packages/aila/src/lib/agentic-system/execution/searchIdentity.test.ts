// cspell:ignore trangles
import { hasSearchIdentityChangedSignificantly } from "./searchIdentity";

describe("hasSearchIdentityChangedSignificantly", () => {
  const base = {
    title: "Photosynthesis",
    subject: "science",
    keyStage: "key-stage-3",
  };

  it("returns true when prev is null", () => {
    expect(hasSearchIdentityChangedSignificantly(null, base)).toBe(true);
  });

  it("returns true when prev is undefined", () => {
    expect(hasSearchIdentityChangedSignificantly(undefined, base)).toBe(true);
  });

  it("returns false for identical identities", () => {
    expect(hasSearchIdentityChangedSignificantly(base, { ...base })).toBe(
      false,
    );
  });

  describe("keyStage comparison", () => {
    it("returns true when keyStage changes", () => {
      const next = { ...base, keyStage: "key-stage-4" };
      expect(hasSearchIdentityChangedSignificantly(base, next)).toBe(true);
    });

    it("returns false for equivalent keyStage aliases", () => {
      const prev = { ...base, keyStage: "ks3" };
      const next = { ...base, keyStage: "key-stage-3" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("normalises year aliases", () => {
      const prev = { ...base, keyStage: "year_7" };
      const next = { ...base, keyStage: "key-stage-3" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });
  });

  describe("subject comparison", () => {
    it("returns true when subject changes to different domain", () => {
      const next = { ...base, subject: "history" };
      expect(hasSearchIdentityChangedSignificantly(base, next)).toBe(true);
    });

    it("treats maths/mathematics as equivalent", () => {
      const prev = { ...base, subject: "maths" };
      const next = { ...base, subject: "mathematics" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("treats mathematics/maths as equivalent", () => {
      const prev = { ...base, subject: "mathematics" };
      const next = { ...base, subject: "maths" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("treats PE abbreviation as equivalent", () => {
      const prev = { ...base, subject: "PE" };
      const next = { ...base, subject: "physical-education" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("treats bio/biology as equivalent", () => {
      const prev = { ...base, subject: "bio" };
      const next = { ...base, subject: "biology" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("uses slug equality for unknown subjects", () => {
      const prev = { ...base, subject: "Quantum Computing" };
      const next = { ...base, subject: "quantum-computing" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(false);
    });

    it("detects change between different unknown subjects", () => {
      const prev = { ...base, subject: "Quantum Computing" };
      const next = { ...base, subject: "Marine Biology" };
      expect(hasSearchIdentityChangedSignificantly(prev, next)).toBe(true);
    });
  });

  describe("title comparison (Jaccard)", () => {
    it.each([
      {
        label: "stopwords stripped",
        prev: "Understanding Photosynthesis",
        next: "Photosynthesis",
        expected: false,
      },
      {
        label: "capitalisation change",
        prev: "photosynthesis",
        next: "Photosynthesis",
        expected: false,
      },
      {
        label: "plural to singular (stem)",
        prev: "Fractions",
        next: "Fraction",
        expected: false,
      },
      {
        label: "ise/ize spelling variants (stem)",
        prev: "Colonise or colonize",
        next: "Colonize",
        expected: false,
      },
      {
        label: "reordered words",
        prev: "World War Two Causes",
        next: "Causes of World War Two",
        expected: false,
      },
      {
        label: "stopwords dominate both sides",
        prev: "Introduction to Programming",
        next: "Advanced Programming",
        expected: false,
      },
      {
        label: "both empty",
        prev: "",
        next: "",
        expected: false,
      },
      {
        label: "both collapse to near-empty after stopword removal",
        prev: "An Introduction",
        next: "A Basic Overview",
        expected: false,
      },
      {
        label: "single-character typo fix (fuzzy match)",
        prev: "Angles in trangles",
        next: "Angles in triangles",
        expected: false,
      },
      {
        label: "US to UK spelling (fuzzy match)",
        prev: "Organizing an argument",
        next: "Organising an argument",
        expected: false,
      },
      {
        label: "word replacement of similar length",
        prev: "Angles in triangles",
        next: "Angle bisectors",
        expected: true,
      },
      {
        label: "completely different topic",
        prev: "Photosynthesis",
        next: "The Roman Empire",
        expected: true,
      },
      {
        label: "one key word differs",
        prev: "World War One",
        next: "World War Two",
        expected: true,
      },
      {
        label: "key content word swap",
        prev: "Photosynthesis in Plants",
        next: "Respiration in Plants",
        expected: true,
      },
      {
        label: "low token overlap (borderline)",
        prev: "Algebra Basics",
        next: "Introduction to Algebraic Expressions",
        expected: true,
      },
    ])(
      "$label: $prev → $next should be $expected",
      ({ prev, next, expected }) => {
        const prevId = { ...base, title: prev };
        const nextId = { ...base, title: next };
        expect(hasSearchIdentityChangedSignificantly(prevId, nextId)).toBe(
          expected,
        );
      },
    );
  });
});
