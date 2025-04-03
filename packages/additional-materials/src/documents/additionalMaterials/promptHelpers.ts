import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";

export const getLessonTranscript = (transcript: string) => {
  return transcript;
};

const renderCycle = (cycle: LooseLessonPlan["cycle1"], label: string) => {
  if (!cycle) return "";

  const {
    title,
    durationInMinutes,
    explanation,
    checkForUnderstanding,
    practice,
    feedback,
  } = cycle;

  const spokenExplanation = Array.isArray(explanation.spokenExplanation)
    ? explanation.spokenExplanation.map((line) => `    - ${line}`).join("\n")
    : `    - ${explanation.spokenExplanation}`;

  return `
### ${label}: ${title} (${durationInMinutes} min)

**Explanation**:
- **Spoken Explanation**:
${spokenExplanation}
- **Accompanying Slide Details**: ${explanation.accompanyingSlideDetails}
- **Slide Text**: ${explanation.slideText}
- **Image Prompt**: ${explanation.imagePrompt}

**Check for Understanding**:
${checkForUnderstanding.map((cfu, i) => `  ${i + 1}. ${typeof cfu === "string" ? cfu : JSON.stringify(cfu)}`).join("\n")}

**Practice**:
${practice}

**Feedback**:
${feedback}
`;
};

export const renderQuiz = (quiz: LooseLessonPlan["starterQuiz"]): string => {
  if (!quiz || quiz.length === 0) return "- N/A";

  return quiz
    .map(({ question, answers, distractors }, index) => {
      return `
**Q${index + 1}: ${question}**
- ✅ Answer${answers.length > 1 ? "s" : ""}:
${answers.map((a) => `  - ${a}`).join("\n")}

- ❌ Distractor${distractors.length > 1 ? "s" : ""}:
${distractors.map((d) => `  - ${d}`).join("\n")}
`;
    })
    .join("\n");
};

export const getLessonDetails = (lessonPlan: LooseLessonPlan) => {
  return `
- **Key Stage**: ${lessonPlan.keyStage}
- **Subject**: ${lessonPlan.subject}
- **Topic**: ${lessonPlan.topic}

- **Learning Outcome**: ${lessonPlan.learningOutcome}


**Learning cycles outcomes**:
${lessonPlan.learningCycles?.map((cycle) => `- ${cycle}`).join("\n") ?? "- N/A"}

**Prior Knowledge Required**:
${lessonPlan.priorKnowledge?.map((pk) => `- ${pk}`).join("\n") ?? "- N/A"}

**Key Learning Points**:
${lessonPlan.keyLearningPoints?.map((point) => `- ${point}`).join("\n") ?? "- N/A"}

**Misconceptions to Address**:
${lessonPlan.misconceptions?.map(({ misconception, description }) => `- **${misconception}**: ${description}`).join("\n") ?? "- None specified"}

**Keywords**:
${lessonPlan.keywords?.map(({ keyword, definition }) => `- **${keyword}**: ${definition}`).join("\n") ?? "- N/A"}

**Starter Quiz**:
${renderQuiz(lessonPlan.starterQuiz)}

**Learning Cycles**:
${renderCycle(lessonPlan.cycle1, "Cycle 1") || "- N/A"}
${renderCycle(lessonPlan.cycle2, "Cycle 2") || "- N/A"}
${renderCycle(lessonPlan.cycle3, "Cycle 3") || "- N/A"}

**Exit Quiz**:
${renderQuiz(lessonPlan.starterQuiz)}

`;
};

export const getKeystageFromYearGroup = (yearGroup: string) => {
  const yearGroupToKeyStageMap: Record<string, string> = {
    reception: "Early Years",
    "1": "key-stage-1",
    "2": "key-stage-1",
    "3": "key-stage-2",
    "4": "key-stage-2",
    "5": "key-stage-2",
    "6": "key-stage-2",
    "7": "key-stage-3",
    "8": "key-stage-3",
    "9": "key-stage-3",
    "10": "key-stage-4",
    "11": "key-stage-4",
  };

  const keyStage = yearGroupToKeyStageMap[yearGroup];
  if (!keyStage) {
    throw new Error(`Invalid year group: ${yearGroup}`);
  }

  return keyStage;
};
