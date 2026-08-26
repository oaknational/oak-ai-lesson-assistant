import {
  getKeyStageLanguageGuidance,
  normaliseKeyStageForPrompt,
} from "../shared/keyStageLanguageGuidance";
import { quizQuestionDesignInstructions } from "../shared/quizQuestionDesign.instructions";
import {
  MAX_SLIDE_LINES,
  STEPS_POINTER_LINE,
  STIMULUS_TYPES,
  WORDS_PER_LINE,
  stimulusPointerLine,
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

#### Task type (hard requirements)

- task types should be relevant to the subject and the phase
- no multiple choice questions or quick recall questions should be used
- they must activate pupils through speaking, writing or doing
- tasks should take pupils approx. 5-7 mins to complete
- base your suggestions on other lessons you have seen at Oak National Academy

#### Cognitive demand (hard requirements)

- focus the cognitive demand of the task on the key learning points taught and checked in the learning cycle
- avoid including unrelated knowledge or skills that shifts cognitive demand away from pupils practising the knowledge from the key learning point taught in the preceding explanation
- tasks should require pupils to think progressively more deeply as they move through it. This can be via numbered statements, or embedded within one continuous activity
- cognitive demand should be age and phase appropriate
- they should vary across learning cycles
- no part of the task may answer another part of the task. Check that nothing in the STIMULUS gives away the answer to a later statement.
- every word in the task must be everyday language, the lesson's keywords, vocabulary taught earlier in this lesson, or anything named in prior knowledge. Do not introduce a new abstract term to compress a longer phrase.

#### The three parts of a task

A task is built from three kinds of parts:

- an un-numbered TASK INSTRUCTION, always the first line
- numbered STATEMENTS that chunk up the main task
- a STIMULUS, where a statement needs one

The TASK INSTRUCTION comes first, then the STATEMENTS in order.

A STIMULUS can be one of two configurations. It can either sit directly beneath the STATEMENT it belongs to, as in Example 1. Or it can be a single STIMULUS that belongs to multiple STATEMENTS as seen in Example 2.

Example 1:

Identify how Roman settlement changed daily life in Britain.

1. Complete the sentences:

Roman settlement brought more ______ where people could buy and sell goods. Some people started using ______ to pay for things. Roman ______ gave people a new place to wash and meet. Roman ______ carried clean water into some towns.

2. Explain another change that Roman settlement brought to daily life:

The Romans built long, straight roads across Britain. Carts, soldiers and traders could travel quickly between towns. News and new goods arrived faster than before.

3. Explain, using the examples, why daily life changed more in some places than in others:

In a town: a family buys bread at the market, pays with coins, and visits the baths. On a farm far from a road: a family grows its own food and lives in a roundhouse, as their grandparents did.

Another configuration that a task can be specified in is with a STIMULUS that applies to all statements.

Example 2:

Explain what impact the use of figurative language in the passage has on the reader.

1. Identify the adjectives and adverbs
2. Identify any personification
3. Use full sentences to explain the impact on the reader

Trapped in a sterile room, she longed to see her family again. Where plush grass adorned with flowers used to grow, skyscrapers now towered into the polluted sky. Hastily, he scanned the surroundings for any threat.

#### How to write tasks

The first line of a task should be a clear, un-numbered TASK INSTRUCTION. It must start with a command word that is both phase-appropriate and matched to the cognitive demand of the work pupils actually do. If the task asks pupils to give reasons, the command word must be an explaining word, not a describing or identifying one. The same applies to the command word in each numbered statement.
The TASK INSTRUCTION is not the learning cycle outcome. The outcome describes what pupils will know; the TASK INSTRUCTION tells pupils what to produce now. Do not restate the outcome as the TASK INSTRUCTION.
Do not include any superfluous or extraneous information that could distract the pupils.
Refer to a STIMULUS by name ("the passage", "the examples", "the data table"), never by position ("below", "above", "on the next line"). The stimulus may be shown on the slide, on a later slide, or on the worksheet, so words like "below" can become untrue.

Example:
Design a letterform that expresses a chosen idea or emotion.

Non-example (extraneous information):
A letterform is the term used when designing the shape of a letter. Design a letterform that expresses a chosen idea or emotion.

After the TASK INSTRUCTION, if the task requires multiple steps use numbered STATEMENTS.

Example:
Write a paragraph explaining why meditation matters to many Buddhists.
1. Write one way meditation helps Buddhists in daily life
2. Write one way meditation follows the Buddha's teachings
3. Join your two ideas to say why meditation matters

After the TASK INSTRUCTION and any numbered STATEMENTS if any require a STIMULUS (${STIMULUS_TYPES.join(", ")}) this must follow it directly. A STIMULUS does not require bullet points or numbers.

Non-example (a STIMULUS that belongs to ONE statement must sit directly beneath it, not at the end of the task):

Identify how Roman settlement changed daily life in Britain.

1. Complete the sentences
2. Explain another change that Roman settlement brought to daily life.
3. Explain using examples why daily life changed more in some places than in others.
Roman settlement brought more ______ where people could buy and sell goods. Some people started using ______ to pay for things. Roman ______ gave people a new place to wash and meet. Some people kept older ______, especially in the countryside.

#### Formatting rules for writing tasks (hard requirements)

- Numbers must only be used for STATEMENTS. Bullet points must never be used.
- The items inside a STIMULUS (items to sort, sentences to complete, calculations) are not STATEMENTS: never number them.

#### Where the task appears (for context - you do not need to trim anything)

- The full task (TASK INSTRUCTION, STATEMENTS, STIMULUS) always appears in the lesson plan and on the worksheet. There is no length limit on the full task.
- The slide shows a version of the same task, built automatically from your text. The slide is a fixed-size box holding at most ${MAX_SLIDE_LINES} lines, counting blank separator lines; the box cannot shrink or grow the text.
- If the full task is over the slide limit, stimuli are moved off the slide automatically, largest first, until the task fits. Moved stimuli appear together on the next slide, and each is replaced in the task by the line "You will find the [stimulus type] on the next slide." (e.g. "${stimulusPointerLine("data table", "next slide")}")
- The next slide is a fixed-size box of the same size, and each moved stimulus gets a short heading naming the statement it belongs to. If the moved stimuli do not all fit on that slide, they appear on the worksheet instead and the line says "on the worksheet".
- If the TASK INSTRUCTION and STATEMENTS alone are still over the limit, the STATEMENTS are replaced with the line "${STEPS_POINTER_LINE}" The TASK INSTRUCTION always appears on the slide and is identical everywhere.
- Pupils always have the full task on the worksheet, so nothing you write is lost.
- Keep the TASK INSTRUCTION and STATEMENTS compact: one step per line, and each line short (about ${WORDS_PER_LINE} words or fewer) so it does not wrap in the slide box - a wrapped line counts as two.
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
