import { speakerNotesTagsToDelete } from "./exportSlidesFullLesson.helpers";

const cycleWithStimulusSlide = {
  practiceStimulusSlideText: "For step 1:\nA data table",
};
const cycleWithout = {};

describe("speakerNotesTagsToDelete", () => {
  it("deletes every stimulus slide when no cycle moved anything onto one", () => {
    const tags = speakerNotesTagsToDelete({
      subject: "history",
      cycle1: cycleWithout,
      cycle2: cycleWithout,
      cycle3: null,
    });
    expect(tags).toEqual([
      "cycle1Stimulus",
      "cycle2Stimulus",
      "cycle3Stimulus",
    ]);
  });

  it("keeps the stimulus slide for cycles that use it", () => {
    const tags = speakerNotesTagsToDelete({
      subject: "history",
      cycle1: cycleWithStimulusSlide,
      cycle2: cycleWithout,
      cycle3: cycleWithStimulusSlide,
    });
    expect(tags).toEqual(["cycle2Stimulus"]);
  });

  it("still removes quiz slides for maths lessons", () => {
    const tags = speakerNotesTagsToDelete({
      subject: "maths",
      cycle1: cycleWithStimulusSlide,
      cycle2: null,
      cycle3: null,
    });
    expect(tags).toEqual([
      "starterQuiz",
      "exitQuiz",
      "cycle2Stimulus",
      "cycle3Stimulus",
    ]);
  });
});
