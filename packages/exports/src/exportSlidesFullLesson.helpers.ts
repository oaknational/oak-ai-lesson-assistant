import type { SpeakerNotesTag } from "./gSuite/slides/deleteSlides";

type CycleStimulusFields =
  | { practiceStimulusSlideText?: string }
  | null
  | undefined;

/**
 * Slides the template carries for every lesson but this lesson does not need.
 * Maths lessons drop the quiz slides; each cycle's stimulus slide is dropped
 * unless the composer moved stimulus material onto it.
 */
export function speakerNotesTagsToDelete(lesson: {
  subject: string;
  cycle1: CycleStimulusFields;
  cycle2?: CycleStimulusFields;
  cycle3?: CycleStimulusFields;
}): SpeakerNotesTag[] {
  const quizTags: SpeakerNotesTag[] =
    lesson.subject === "maths" ? ["starterQuiz", "exitQuiz"] : [];
  const stimulusTags = (
    [
      ["cycle1Stimulus", lesson.cycle1],
      ["cycle2Stimulus", lesson.cycle2],
      ["cycle3Stimulus", lesson.cycle3],
    ] as const
  )
    .filter(([, cycle]) => !cycle?.practiceStimulusSlideText)
    .map(([tag]) => tag);
  return [...quizTags, ...stimulusTags];
}
