import type { LooseLessonPlan } from "../../../../aila/src/protocol/schema";

const getLessonTranscript = (transcript: string) => {
  return transcript;
};

const getLessonDetails = (lessonPlan: LooseLessonPlan) => {
  return `
- **Key Stage**: ${lessonPlan.keyStage}
- **Subject**: ${lessonPlan.subject}
- **Topic**: ${lessonPlan.topic}
- **Learning Outcome**: ${lessonPlan.learningOutcome}

**Key Learning Points**:
${lessonPlan.keyLearningPoints?.map((point) => `- ${point}`).join("\n") ?? "- N/A"}

**Misconceptions to Address**:
${lessonPlan.misconceptions?.map(({ misconception, description }) => `- **${misconception}**: ${description}`).join("\n") ?? "- None specified"}

**Keywords**:
${lessonPlan.keywords?.map(({ keyword, definition }) => `- **${keyword}**: ${definition}`).join("\n") ?? "- N/A"}

**Prior Knowledge Required**:
${lessonPlan.priorKnowledge?.map((pk) => `- ${pk}`).join("\n") ?? "- N/A"}

**Learning Cycles**:
${lessonPlan.learningCycles?.map((cycle) => `- ${cycle}`).join("\n") ?? "- N/A"}


`;
};

// Additional Homework Prompt

export const additionalHomeworkPrompt = (
  lessonPlan: LooseLessonPlan,
  previousOutput?: object | null,
  message?: string | null,
) => {
  if (previousOutput && message) {
    return `
Modify the following resource based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the resource to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
    `;
  } else {
    return `
Generate a homework task for the lesson: **"${lessonPlan.title}"**.

**Requirements**:
- The task must be **clear, subject-specific, and age-appropriate** for key stage ${lessonPlan.keyStage}.
- Ensure questions are **engaging, relevant, and aligned with the learning objectives**.
- The task should reinforce the student's understanding of of the lesson content.

**Lesson Details**:
${getLessonDetails(lessonPlan)}
    `;
  }
};

export const additionalHomeworkSystemPrompt = () => {
  return `
You are an expert UK teacher generating homework tasks.

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given key stage.
- Keep questions **engaging and relevant** to reinforce learning.
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
  `;
};

// Reading comprehension prompt

export const additionalComprehensionPrompt = (
  lessonPlan: LooseLessonPlan,
  previousOutput?: object | null,
  message?: string | null,
) => {
  if (previousOutput && message) {
    return `
Modify the following resource based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the resource to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
    `;
  } else {
    return `
Generate a reading comprehension tasks for the lesson: **"${lessonPlan.title}"**.

**Requirements**:
- The task must be **clear, subject-specific, and age-appropriate** for key stage ${lessonPlan.keyStage}.
- Ensure questions are **engaging, relevant, and aligned with the learning objectives**.
- The task should reinforce the student's understanding of of the lesson content.

**Lesson Details**:
${getLessonDetails(lessonPlan)}
    `;
  }
};

export const additionalComprehensionSystemPrompt = () => {
  return `
You are an expert UK teacher generating a reading comprehension tasks.

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given key stage reading age.
- Keep questions **engaging and relevant** to reinforce learning.
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
  `;
};

// science practical activity prompt

export const additionalSciencePracticalActivityPrompt = (
  lessonPlan: LooseLessonPlan,
  previousOutput?: object | null,
  message?: string | null,
  transcript?: string,
) => {
  if (previousOutput && message) {
    return `
Modify the following resource based on user feedback.

**Previous Output**:  
${JSON.stringify(previousOutput, null, 2)}

**User Request**:  
${message}

Adapt the resource to reflect the request while ensuring it aligns with the following lesson details:

${getLessonDetails(lessonPlan)}
    `;
  } else {
    return `
 Given the following transcript of a UK Key Stage 3 or 4 science lesson, generate a structured practical activity plan for pupils. Use the lesson slide content provided to fill in the relevant details in each field, following these guidelines:

    1. **Practical Aim**: Identify the main goal of the activity from the lesson slide content and place it in the 'practical_aim' field.
    2. **Purpose of Activity**: Write a description explaining the learning outcomes for pupils, covering both substantive knowledge (the main topic or concept) and disciplinary knowledge (specific techniques or methods).
    3. **Teacher's Tip**: Suggest any setup tips, potential pitfalls, or recommended demonstration methods based on lesson slide content or transcript context. If no practical is explicitly mentioned, infer possible tips or general advice.
    4. **Equipment List**: List the required equipment with specific quantities or volumes. Use the following terminology consistently:
        - Use 'cm³' instead of 'ml' where appropriate
        - Use 'top pan balance' instead of 'electronic balance'
        - Use 'forceps' instead of 'tweezers'
        - Use 'safety goggles' instead of 'protective goggles'
        - Use 'force meter' consistently (not 'newton meter' or 'spring balance')
        - Use 'stopwatch' instead of 'timer'
        - Use 'gauze' instead of 'gaze mat'
        - Use 'filter funnel' instead of 'funnel'
        - Use 'set of masses' instead of 'set of weights'
        - Add a space between numeric values and units (e.g., '10 cm', '1 dm³'), except for degrees (e.g., '45°')
        - Use 'dm³' instead of 'L' for litres
        - Use 'heat resistant mat' consistently (not 'heatproof mat')
        - Do not use any brand or commercial names for equipment
        - Use '×' for multiplication when indicating multiples (not 'x')

    5. **Method**: Outline the step-by-step process for the activity using precise instructions. Number each step using numerical digits only (e.g., 1, 2, 3).
        - Variables in formulas/equations should not be capitalised (e.g., "work = force × distance")
        - Use 'potential difference' instead of 'voltage'
        - Use full chemical names instead of formulas (e.g., 'sodium chloride' not 'NaCl')
        - In axis labels, italicise x and y (e.g., '*x*-axis', '*y*-axis')
        - The term 'periodic table' should not be capitalised
        - Use 'Van der Graaff' for the generator spelling
        - All measurements should follow UK conventions with appropriate spacing
        - Formulas should use lowercase variables (e.g., "force = mass × acceleration")

    6. **Results Table**: Provide table headings for independent and dependent variables, units where applicable, and example results if mentioned.
    7. **Health and Safety**: Include any safety considerations mentioned or implied in the lesson slide content.
    8. **Risk Assessment**: Use the standard science risk assessment notice: "The information outlined in this guidance contains advice for how to work safely in and out of the primary classroom. However, risk assessments are the responsibility of the individual school. Please contact a local or national advisory service, such as CLEAPSS, on all aspects of health and safety for further support."

    If there is no practical explicitly mentioned in the lesson slide content or transcript, include this information in the 'teachers_tip' field and infer an appropriate practical activity based on the context provided. 

**Lesson Details**:
${getLessonDetails(lessonPlan)}

**Transcript**:
${transcript && getLessonTranscript(transcript)}
    `;
  }
};

export const additionalSciencePracticalActivitySystemPrompt = () => {
  return `
"You are a uk curriculum teaching assistant. You are an expert of sciences. You are amazing at generating activities for students. You are a great teacher and pedagogy expert.".

**Guidelines**:
- Ensure tasks are **clear, subject-specific, and appropriate** for the given key stage reading age.
- **Do not** include markdown in your response.
- **Do not** include any americanisms.
  `;
};
