import {
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";
import { quizQuestionDesignInstructions } from "../shared/quizQuestionDesign.instructions";
import {
  MAX_SLIDE_LINES,
  STIMULUS_TYPES,
  WORDS_PER_LINE,
} from "./practiceTask";

export function cyclesInstructions(keyStage: string): string {
  const normalisedKeyStage = normaliseKeyStageForPrompt(keyStage);
  const lessonDuration =
    normalisedKeyStage === "ks1"
      ? "each LEARNING CYCLE should aim to be about 8 minutes because the total lesson time is 40 minutes."
      : "these should take approximately 10 minutes to allow time for the teacher to also deliver the quizzes in a 50 minute lesson.";

  return `# Task

Generate a LEARNING CYCLE to structure the main body of the lesson. ${lessonDuration}
A LEARNING CYCLE is the way that Oak structures the main body of a lesson. The content of the LEARNING CYCLE should enable pupils to achieve the LEARNING CYCLE OUTCOME
It is made up of an EXPLANATION of some KEY LEARNING POINTS, with CHECK FOR UNDERSTANDING questions built into it to ensure pupils have understood the EXPLANATION AND KEY LEARNING POINTS.
There should then be a PRACTICE task where pupils practice the KEY LEARNING POINT and check that they can achieve the LEARNING CYCLE OUTCOME.  The FEEDBACK should help pupils to understand whether they have mastered the LEARNING CYCLE OUTCOME.
Each LEARNING CYCLE should map to one of the LEARNING CYCLE OUTCOMES.
If a pupil completes all LEARNING CYCLES, they should have achieved the LEARNING OUTCOME for the lesson.

${getKeyStageLanguageGuidance(normalisedKeyStage)}

## Target cycle and cohesion rules

- Map the generated cycle directly to the matching LEARNING CYCLE OUTCOME:
  - cycle1 maps to the first LEARNING CYCLE OUTCOME.
  - cycle2 maps to the second LEARNING CYCLE OUTCOME.
  - cycle3 maps to the third LEARNING CYCLE OUTCOME.
- Vary the practice task and check-for-understanding formats across cycles where this is pedagogically sensible.

## Cycle Structure

### 1. Learning cycle title

- A short, succinct version of the LEARNING CYCLE OUTCOME.
- Max 50 characters
- Written in sentence case
- Example: 'Animal adaptations in extreme environments'

### 2. Explanation

Purpose:

- This is the first phase of a learning cycle.  The teacher will use this to structure how they will explain this concept to their pupils.
- There are two elements of an explanation: the spoken teacher explanation and the accompanying visual elements (slide text and slide image).
- You should break the explanation down into chunks to support them with how to explain a concept.

**(i) Spoken explanation**:
- AILA_TO_TEACHER voice
- 1-5 points, each containing the actual explanation itself — the substance pupils should come to understand, stated as fact — not an instruction describing what to explain. Try to keep each point to one sentence.
  ✓ "Photosynthesis is how plants use sunlight, water and carbon dioxide to make glucose and oxygen."
  ✗ "Define photosynthesis." / "Explain how photosynthesis works." (names the topic but contains no explanation)
- Include key concepts, models, analogies, examples
- You should suggest appropriate moments for teachers to model procedures, including appropriate methods or equipment to use tof this
- Link to prior knowledge
- Address common misconceptions and mistakes
- Write each point in the words the teacher would actually speak aloud to pupils — apply the key stage language guidance above, since the vocabulary must be at pupil level even though these are teaching notes
- Maximise intrinsic load, minimise extraneous load
- Minimise cognitive load by:
  - Starting with concrete ideas before moving onto more abstract ones.
  - Breaking concepts down into simple steps
  - Only introducing one concept in each point
  - Not including extraneous, unnecessary detail.
- Be as specific as possible — give the actual content, don't gesture at it
Example: rather than "Describe the meaning of the items on a Seder plate", say "The shank bone (zeroa) represents the lamb sacrificed at Passover, the bitter herbs (maror) represent the bitterness of slavery in Egypt, and the sweet paste (haroset) represents the mortar the enslaved Israelites used to make bricks."

**(ii) Accompanying Slide Detail**: describe what should be seen on the slides to support with the spoken explanation e.g. "a simple diagram showing two hydrogen atoms sharing electrons to form a covalent bond"
**(iii) Image Search Suggestion**: a phrase that a teacher can use in a search engine to find an appropriate image to go on their slide e.g. 'a diagram showing the covalent bond in a hydrogen molecule'.
**(iv) Slide text**: this will be displayed to pupils on the slides during the lesson.  It should be a short, succinct summary of the key point being made in the explanation and should not include any teacher narrative.

Example: 'hydrogen atoms are bonded together with a covalent bond'.
Non-example: 'now we will look at how hydrogen atoms bond together'.

### 3. Checks for Understanding

Content:

- This should check that pupils have understood the KEY LEARNING POINTS covered in the explanation.
- You should choose the two highest leverage questions to ask.
- They should also test pupils do not hold any common misconceptions.
- Do not duplicate any questions in the starter quiz.

#### Question Design

${quizQuestionDesignInstructions(normalisedKeyStage)}

### 4. Practice Task

A practice task is placed at the end of each learning cycle.
It enables pupils to practice the skills and knowledge related to key learning points that they have learnt in the explanation and have checked in the checks for understanding.
If a pupil completes the PRACTICE TASK successfully, they should have achieved the LEARNING CYCLE OUTCOME.
If they complete all PRACTICE TASKS in the lesson, they should have achieved the LEARNING OUTCOME.

Audience: pupils in the class
Voice: TEACHER_TO_PUPIL_WRITTEN

#### Task type (hard requirement)

- task types should be relevant to the subject and the phase
- no multiple choice questions or quick recall questions should be used
- they must activate pupils through speaking, writing or doing
- they should take pupils approx. 5-7 mins to complete the task
- base your suggestions on other lessons you have seen at Oak National Academy

#### Cognitive demand

- focus the cognitive demand of the task on the key learning points taught and checked in the learning cycle
- avoid including unrelated knowledge or skills that shifts cognitive demand away from pupils practising the knowledge from the key learning point taught in the preceding explanation
- tasks should require pupils to think progressively more deeply as they move through it. This can be via numbered sub-questions or embedded within one continuous activity
- tasks that require multiple steps can include CHUNKING: smaller, sequential steps to support cognitive load
- cognitive demand should be age and phase appropriate
- they should vary across learning cycles

#### How to write tasks

Return the practice task as four named parts. They are rendered into the lesson plan, the worksheet and the slides automatically.

**INSTRUCTION**: the first line of the task, a clear instruction. It must start with a phase-appropriate command word. Do not include any superfluous or extraneous information that could distract the pupils. Do not add orientation steps such as "Look at the pictures" or "Read the text below"; the instruction implies them. The instruction may be followed by numbered sub-questions (1. 2. 3.), each on its own line, requiring pupils to think progressively more deeply.

Example: 'Design a letterform that expresses a chosen idea or emotion.'
Non-example: 'A letterform is the term used when designing the shape of a letter. Design a letterform that expresses a chosen idea or emotion.'

**CHUNKING**: if the task requires multiple steps, provide them as chunking steps. They are rendered as bullet points automatically, so do not include bullet markers or numbers.

Example, for the letterform instruction above:
choose one letter to design
choose an idea or emotion to express
choose colours and shapes that communicate your choice
draw the outline of your letterform
add colours and shapes
evaluate your design

**STIMULUS**: material the pupil works from, such as a text extract, a data set or results table. Label its type as one of: ${STIMULUS_TYPES.join(", ")}. No bullet points in the content.

**SCAFFOLDING**: support included at the end of the task, for example a word bank. No bullet points.

#### Formatting rules (hard requirement)

- Numbers must only be used within the INSTRUCTION, for its numbered sub-questions. They must not be used in the CHUNKING, STIMULUS or SCAFFOLDING.
- Do not include bullet markers anywhere; CHUNKING steps are rendered as bullets automatically.

#### Where the task appears (for context - you do not need to trim anything)

- The full task (INSTRUCTION, CHUNKING, STIMULUS, SCAFFOLDING) always appears in the lesson plan and on the worksheet. There is no length limit on the full task.
- The slide shows a version of the same task, built automatically from your parts. The slide is a fixed-size box holding at most ${MAX_SLIDE_LINES} lines, counting blank separator lines; the box cannot shrink or grow the text.
- If the full task is over the slide limit, parts are removed from the slide automatically, in this order: first the STIMULUS is replaced with the line "You will find the [stimulus type] on the worksheet."; if it is still over, the SCAFFOLDING is removed; as a last resort the CHUNKING is replaced with "You will find the steps on the worksheet." The INSTRUCTION always appears and is identical in all three places.
- Pupils always have the full task on the worksheet, so nothing you write is lost.
- Keep the INSTRUCTION and CHUNKING compact: one step per line, and each line short (about ${WORDS_PER_LINE} words or fewer) so it does not wrap in the slide box - a wrapped line counts as two.
- Do not refer to the worksheet, the slides or any other document in the task text, and do not invent document names. Pointer lines are added automatically when needed.
- Prefer tasks whose parts all fit on the slide; only include a large STIMULUS when the task genuinely requires it.

### 5. Feedback

This section provides pupils with the chance to get feedback on their practice task. This is often done in a class of 30 pupils so consider how you might show the correct answer for this audience. The teacher will not have time to check each pupil's work.

- Must be pupil-facing (it will be shown on slides)
- Written in the pupil voice.
- Choose the most appropriate format (indicate this at the start of the feedback)
  - Model Answer (e.g. sample diagram or response)
  - Worked Example (e.g. steps in a calculation)
  - Success Criteria (e.g. 3 key features of a good answer)
- If you have included a keyword bank or sentence starters in the practice task, update the feedback section to include these.
- Feedback is shown on one slide in the same fixed-size box as the practice task. It must fit in at most 12 lines (aim for about 10), counting every line and blank separator, with each line short enough not to wrap. If a full worked example will not fit, give the key steps or success criteria only.

**Examples:**
- Practice = completing calculations
  Feedback = worked examples showing the steps in the calculation with the correct answers.
- Practice = bouncing a basketball
  Feedback: success criteria "1. Bounce the ball with two hands. 2. Bounce the ball to chest height."
- Practice: explaining the type of bonding shown in a molecule
  Feedback: 'model answer: I can tell that this is a covalent bond because there are two electrons being shared by the pair of atoms.

**Non-example:** "Get pupils to mark their answer above covalent bonding"`;
}
