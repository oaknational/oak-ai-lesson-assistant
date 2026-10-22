export type LessonRestriction =
  | "restricted-works"
  | "restricted-media"
  | "copyright-feature"
  | "missing-restriction-data";

export type LessonFeatures = Record<string, unknown> | null | undefined;

interface LessonRestrictionInput {
  tpcWorksMaxRestriction: string | null | undefined;
  tpcMediaMaxRestriction: string | null | undefined;
  features: LessonFeatures;
}

export interface LessonRestrictionsConfig {
  readonly copyrightConflictFeatureKeys: readonly string[];
  readonly tpcLevelsTreatedAsRestricted: ReadonlySet<string>;
  readonly excludedSubjectSlugs: ReadonlySet<string>;
  readonly transcriptExcludedSubjectSlugs: ReadonlySet<string>;
}

export const LESSON_RESTRICTIONS_CONFIG: LessonRestrictionsConfig = {
  copyrightConflictFeatureKeys: ["has_copyright_conflict"],
  tpcLevelsTreatedAsRestricted: new Set(["Restricted", "Highly restricted"]),
  excludedSubjectSlugs: new Set([
    "art",
    "french",
    "geography",
    "german",
    "music",
    "religious-education",
    "spanish",
  ]),
  transcriptExcludedSubjectSlugs: new Set(["english"]),
};

export function getLessonRestrictions(
  levels: LessonRestrictionInput | undefined,
  config: LessonRestrictionsConfig = LESSON_RESTRICTIONS_CONFIG,
): LessonRestriction[] {
  if (!levels) return ["missing-restriction-data"];
  const { tpcWorksMaxRestriction, tpcMediaMaxRestriction, features } = levels;
  // Compare case- and whitespace-insensitively so 'highly restricted' still matches
  const normaliseLevel = (level: string) => level.trim().toLowerCase();
  const restrictedLevels = new Set(
    [...config.tpcLevelsTreatedAsRestricted].map(normaliseLevel),
  );
  const isRestrictedLevel = (level: string | null | undefined) =>
    restrictedLevels.has(normaliseLevel(level ?? ""));
  const restrictions: LessonRestriction[] = [];

  if (isRestrictedLevel(tpcWorksMaxRestriction))
    restrictions.push("restricted-works");
  if (isRestrictedLevel(tpcMediaMaxRestriction))
    restrictions.push("restricted-media");
  const hasFeature = (key: string) =>
    features != null && key in features && features[key] !== false;
  if (config.copyrightConflictFeatureKeys.some(hasFeature)) {
    restrictions.push("copyright-feature");
  }

  return restrictions;
}

/** Any of these exclude a lesson outright */
const LESSON_EXCLUSIONS: ReadonlySet<LessonRestriction> = new Set([
  "copyright-feature",
  "missing-restriction-data",
  "restricted-works",
]);

/** Any of these keep the lesson but drop its transcript */
const TRANSCRIPT_EXCLUSIONS: ReadonlySet<LessonRestriction> = new Set([
  "restricted-media",
]);

export const isSubjectExcluded = (
  subjectSlug: string,
  config: LessonRestrictionsConfig = LESSON_RESTRICTIONS_CONFIG,
): boolean => config.excludedSubjectSlugs.has(subjectSlug);

export const shouldExcludeLesson = (restrictions: LessonRestriction[]) =>
  restrictions.some((restriction) => LESSON_EXCLUSIONS.has(restriction));

export const shouldExcludeTranscript = (
  {
    restrictions,
    subjectSlugs,
  }: {
    restrictions: LessonRestriction[];
    subjectSlugs: string[];
  },
  config: LessonRestrictionsConfig = LESSON_RESTRICTIONS_CONFIG,
): boolean =>
  restrictions.some((restriction) => TRANSCRIPT_EXCLUSIONS.has(restriction)) ||
  subjectSlugs.length === 0 ||
  subjectSlugs.some((subjectSlug) =>
    config.transcriptExcludedSubjectSlugs.has(subjectSlug),
  );
