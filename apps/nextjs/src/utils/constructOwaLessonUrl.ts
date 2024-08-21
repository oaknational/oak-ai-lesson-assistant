/*
 *
 * NOTE: This constructs urls for the legacy content, once new content is introduced the syntheticProgrammeSlug will need to be updated. Tiers and exam boards will also need to be considered
 *
 */
import { z } from "zod";

export function constructOwaLessonUrl(
  keyStageSlug: string,
  subjectSlug: string,
  unitSlug: string,
  lessonSlug: string,
) {
  const keyStageConverter = {
    "early-years": "eyfs",
    "key-stage-1": "ks1",
    "key-stage-2": "ks2",
    "key-stage-3": "ks3",
    "key-stage-4": "ks4",
    "key-stage-5": "ks5",
  };
  let primaryOrSecondary = "";

  if (
    keyStageSlug === "early-years" ||
    keyStageSlug === "key-stage-1" ||
    keyStageSlug === "key-stage-2"
  ) {
    primaryOrSecondary = "primary";
  }
  if (keyStageSlug === "key-stage-3" || keyStageSlug === "key-stage-4") {
    primaryOrSecondary = "secondary";
  }

  const safeParsedKeyStage = keyStageSchema.safeParse(keyStageSlug);
  let syntheticProgrammeSlug;
  if (safeParsedKeyStage && primaryOrSecondary && subjectSlug) {
    syntheticProgrammeSlug = `${subjectSlug}-${primaryOrSecondary}-${
      keyStageConverter[keyStageSlug as KeyStage]
    }-l`;
  }
  if (lessonSlug && safeParsedKeyStage && primaryOrSecondary && subjectSlug) {
    return `/teachers/programmes/${syntheticProgrammeSlug}/units/${unitSlug}/lessons/${lessonSlug}`;
  }
  return;
}

type KeyStage = z.infer<typeof keyStageSchema>;

const keyStageSchema = z.enum([
  "early-years",
  "key-stage-1",
  "key-stage-2",
  "key-stage-3",
  "key-stage-4",
  "key-stage-5",
]);
