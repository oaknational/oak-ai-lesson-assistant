export const subjectWarnings = {
  unsupportedSubject:
    "The lesson subject you’ve chosen is in an area where AI tools like me don’t work at our best. I’m trying to get better on my accuracy here, but please double-check everything before using this plan in the classroom. Thank you!",
  unknownSubject:
    "The lesson you’ve chosen isn't covered by Oak. I can still make you a plan, but it might not be up to the standard you’re expecting, so please double-check everything before using it in the classroom. Thank you!",
};

export const subjects = [
  "science",
  "spanish",
  "maths",
  "german",
  "creative-arts",
  "physical-development",
  "communication-and-language",
  "computing",
  "independent-living",
  "music",
  "citizenship",
  "french",
  "physical-education",
  "history",
  "latin",
  "religious-education",
  "computing-non-gcse",
  "drama",
  "biology",
  "chemistry",
  "numeracy",
  "english",
  "literacy",
  "geography",
  "design-technology",
  "expressive-arts-and-design",
  "art",
  "rshe-pshe",
  "psed",
  "understanding-the-world",
  "english-spelling",
  "english-reading-for-pleasure",
  "english-grammar",
  "combined-science",
  "physics",
];

export const unsupportedSubjects = [
  "maths",
  "science",
  "mfl",
  "music",
  "physical-education",
  "biology",
  "chemistry",
  "physics",
  "rshe-pshe",
  "french",
  "spanish",
  "german",
  "combined-science",
];

export const keyStages = [
  "key-stage-2",
  "key-stage-3",
  "key-stage-1",
  "key-stage-4",
  "specialist",
  "early-years-foundation-stage",
];

export const supportedSubjects = subjects?.filter(
  (subject) => !unsupportedSubjects.includes(subject),
);
