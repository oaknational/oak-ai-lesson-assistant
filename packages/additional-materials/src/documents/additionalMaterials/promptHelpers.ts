import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";
import type { LessonPlanSchemaTeachingMaterials } from "./sharedSchema";

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
  if (!quiz || !quiz.questions?.length) return "- N/A";

  return quiz.questions
    .map((q, index) => {
      const baseQuestion = `**Q${index + 1}: ${q.question}**`;

      switch (q.questionType) {
        case "multiple-choice": {
          const { answers, distractors } = q;
          return `
${baseQuestion}
- ✅ Answer${answers.length > 1 ? "s" : ""}:
${answers.map((a) => `  - ${a}`).join("\n")}

- ❌ Distractor${distractors.length > 1 ? "s" : ""}:
${distractors.map((d) => `  - ${d}`).join("\n")}
`;
        }

        case "short-answer": {
          const { answers } = q;
          return `
${baseQuestion}
- ✅ Acceptable answer${answers.length > 1 ? "s" : ""}:
${answers.map((a) => `  - ${a}`).join("\n")}
`;
        }

        case "match": {
          const { pairs } = q;
          return `
${baseQuestion}
- Match the following pairs:
${pairs.map((p) => `  - ${p.left} → ${p.right}`).join("\n")}
`;
        }

        case "order": {
          const { items } = q;
          return `
${baseQuestion}
- Correct order:
${items.map((item, i) => `  ${i + 1}. ${item}`).join("\n")}
`;
        }

        default: {
          // Fallback for any unhandled types
          const _exhaustiveCheck: never = q;
          return `${baseQuestion} (Type: unknown)`;
        }
      }
    })
    .join("\n");
};

export const getLessonDetails = (
  lessonPlan: LessonPlanSchemaTeachingMaterials,
) => {
  const lines = [
    `- **Lesson title**: ${lessonPlan.title}`,
    `- **Key stage**: ${lessonPlan.keyStage}`,
    `- **Year**: ${lessonPlan.year}`,
    `- **Subject**: ${lessonPlan.subject}`,
    `- **Topic**: ${lessonPlan.topic ?? "N/A"}`,
    "",
  ];

  if (lessonPlan.learningOutcome) {
    lines.push(`- **Learning Outcome**: ${lessonPlan.learningOutcome}`);
    lines.push("");
  }

  if (lessonPlan.learningCycles?.length) {
    lines.push("**Learning cycles outcomes**:");
    lines.push(...lessonPlan.learningCycles.map((cycle) => `- ${cycle}`));
    lines.push("");
  }

  if (lessonPlan.priorKnowledge?.length) {
    lines.push("**Prior Knowledge Required**:");
    lines.push(...lessonPlan.priorKnowledge.map((pk) => `- ${pk}`));
    lines.push("");
  }

  if (lessonPlan.keyLearningPoints?.length) {
    lines.push("**Key Learning Points**:");
    lines.push(...lessonPlan.keyLearningPoints.map((point) => `- ${point}`));
    lines.push("");
  }

  if (lessonPlan.misconceptions?.length) {
    lines.push("**Misconceptions to Address**:");
    lines.push(
      ...lessonPlan.misconceptions.map(
        ({ misconception, description }) =>
          `- **${misconception}**: ${description}`,
      ),
    );
    lines.push("");
  }

  if (lessonPlan.keywords?.length) {
    lines.push("**Keywords**:");
    lines.push(
      ...lessonPlan.keywords.map(
        ({ keyword, definition }) => `- **${keyword}**: ${definition}`,
      ),
    );
    lines.push("");
  }

  if (lessonPlan.starterQuiz) {
    const starterQuiz = renderQuiz(lessonPlan.starterQuiz);
    lines.push("**Starter Quiz**:");
    lines.push(starterQuiz);
    lines.push("");
  }

  const cycleSections = [
    renderCycle(lessonPlan.cycle1, "Cycle 1"),
    renderCycle(lessonPlan.cycle2, "Cycle 2"),
    renderCycle(lessonPlan.cycle3, "Cycle 3"),
  ].filter(Boolean);

  if (cycleSections.length) {
    lines.push("**Learning Cycles**:");
    lines.push(...cycleSections);
    lines.push("");
  }

  if (lessonPlan.exitQuiz) {
    const exitQuiz = renderQuiz(lessonPlan.exitQuiz);
    lines.push("**Exit Quiz**:");
    lines.push(exitQuiz);
    lines.push("");
  }

  if (lessonPlan.transcript) {
    lines.push("**Transcript**:");
    lines.push(lessonPlan.transcript);
  }

  return lines.join("\n");
};

export const getKeystageFromYearGroup = (yearGroup: string) => {
  // Extract the numeric part of the year group
  const numericYearGroup = parseInt(yearGroup.replace(/\D/g, ""), 10);

  const yearGroupToKeyStageMap: Record<number, string> = {
    1: "key-stage-1",
    2: "key-stage-1",
    3: "key-stage-2",
    4: "key-stage-2",
    5: "key-stage-2",
    6: "key-stage-2",
    7: "key-stage-3",
    8: "key-stage-3",
    9: "key-stage-3",
    10: "key-stage-4",
    11: "key-stage-4",
    12: "key-stage-5",
    13: "key-stage-5",
  };

  const keyStage = yearGroupToKeyStageMap[numericYearGroup];
  if (!keyStage) {
    return "higher-education";
  }

  return keyStage;
};

export const getYearGroupsFromKeyStage = (keyStage: string): number[] => {
  const keyStageToYearGroupsMap: Record<string, number[]> = {
    "key-stage-1": [1, 2],
    "key-stage-2": [3, 4, 5, 6],
    "key-stage-3": [7, 8, 9],
    "key-stage-4": [10, 11],
    "key-stage-5": [12, 13],
    "higher-education": [],
  };

  return keyStageToYearGroupsMap[keyStage] ?? [];
};

export const language = `LANGUAGE 
  Use British English spelling and vocabulary (e.g. colour not color, centre not center, rubbish not trash) unless the user sets a different primary language. This reflects our UK teacher audience.

  `;

export const getQuizStructure = () => {
  return `The quiz should use the following structure:

1. [question text here - max 200 characters]

a. [answer a - max 80 characters]

b. [answer b - max 80 characters]

c. [answer c - max 80 characters]`;
};

export const getQuizRequirements = () => {
  return `REQUIREMENTS:
- There should be 10 questions
- Each question should have one correct answer and two PLAUSIBLE DISTRACTORS
- Put answers in alphabetical order
- Questions should get progressively harder`;
};

export const getQuizAvoids = () => {
  return `AVOID:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions
- Answers should always start with lower-case letters unless they are proper nouns or acronyms. Cities and countries should be capitalised.
- Do not repeat questions from the lesson details`;
};

export const getQuizSystemMessage = (quizType: "starter" | "exit") => {
  const purpose =
    quizType === "starter"
      ? "a starter quiz to assess prior knowledge"
      : "an exit quiz to assess learning from today's lesson";

  const additionalInstructions =
    quizType === "starter"
      ? "- Questions increase in difficulty through the quiz\n- No jargon or overly technical language beyond the pupils' understanding"
      : "- Questions focus on the most important concepts from the lesson";

  return `
You are an expert UK teacher generating ${purpose}.

Your task is to create a high-quality, age-appropriate multiple-choice quiz with 10 questions.

The quiz should follow this structure for each question:
1. A clear question (max 200 characters)
2. Three options (a, b, c) - one correct answer and two plausible distractors (max 80 characters each)

Make sure that:
- One correct answer is clearly marked as correct in your JSON output
- Distractors are plausible but unambiguously incorrect
- Answers follow alphabetical ordering
${additionalInstructions}
- The content is appropriate for UK schools
- British English spelling and conventions are used throughout
- All answers should start with lower case letters unless they are a proper noun or a known acronym, city and country names should always be capitalised.

Avoid:
- Negatively phrased questions (e.g., "Which is NOT…")
- "All of the above" or "None of the above" options
- True/false questions

${language}
  `;
};
