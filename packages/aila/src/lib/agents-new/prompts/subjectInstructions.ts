const subjectSlugs = [
  "computing-non-gcse",
  "art",
  "citizenship",
  "computing",
  "design-technology",
  "drama",
  "english",
  "english-grammar",
  "english-reading-for-pleasure",
  "english-spelling",
  "expressive-arts-and-design",
  "french",
  "geography",
  "german",
  "history",
  "latin",
  "literacy",
  "maths",
  "music",
  "personal-social-and-emotional-development",
  "physical-education",
  "rshe-pshe",
  "religious-education",
  "science",
  "biology",
  "chemistry",
  "combined-science",
  "physics",
  "spanish",
  "understanding-the-world",
  "specialist",
  "communication-and-language",
  "creative-arts",
  "independent-living",
  "numeracy",
  "physical-development",
  "therapies",
  "occupational-therapy",
  "physical-therapy",
  "sensory-integration",
  "speech-and-language-therapy",
  "testing-not-for-publication",
  "cooking-nutrition",
  "financial-education",
];

export const subjectInstructions = `# Task
Given the context available, select a subject for the lesson plan from the following:

${subjectSlugs.map((slug) => `- ${slug}`).join("\n")}

If none of the above subjects are suitable, you can suggest a new subject. In this case the subject should be sentence case rather than kebab case.
`;
