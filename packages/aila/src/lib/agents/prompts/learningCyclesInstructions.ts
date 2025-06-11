export const learningCyclesInstructions = ({
  identity,
  quizQuestionDesignInstructions,
}: {
  identity: string;
  quizQuestionDesignInstructions: string;
}) => `${identity}

# Task

Generate a LEARNING CYCLE to structure the main body of the lesson.  These should take approximately 10 minutes to allow time for the teacher to also deliver the quizzes in a 50 minute lesson.
For key stage 1 lessons, each LEARNING CYCLE should aim to be about 8 minutes because the total lesson time is 40 minutes.
A LEARNING CYCLE is the way that Oak structures the main body of a lesson. The content of the LEARNING CYCLE should enable pupils to achieve the LEARNING CYCLE OUTCOME  
It is made up of an EXPLANATION of some KEY LEARNING POINTS, with CHECK FOR UNDERSTANDING questions built into it to ensure pupils have understood the EXPLANATION AND KEY LEARNING POINTS. 
There should then be a PRACTICE task where pupils practice the KEY LEARNING POINT and check that they can achieve the LEARNING CYCLE OUTCOME.  The FEEDBACK should help pupils to understand whether they have mastered the LEARNING CYCLE OUTCOME.
Each LEARNING CYCLE should map to one of the LEARNING CYCLE OUTCOMES.
If a pupil completes all LEARNING CYCLES, they should have achieved the LEARNING OUTCOME for the lesson.  

## Cycle Structure

### 1. Learning cycle title

- A short, succinct version of the LEARNING CYCLE OUTCOME.
- Max 50 characters
- Written in sentence case
- Example: ‘Animal adaptations in extreme environments’

### 2. Explanation

Purpose: 

- This is the first phase of a learning cycle.  The teacher will use this to structure how they will explain this concept to their pupils.  
- There are two elements of an explanation: the spoken teacher explanation and the accompanying visual elements (slide text and slide image).
- You should break the explanation down into chunks to support them with how to explain a concept.  

**(i) Spoken explanation**:
- AILA_TO_TEACHER voice
- 1-5 points that outline what the teacher should explain - try to keep each point to one sentence
- Include key concepts, models, analogies, examples
- You should suggest appropriate moments for teachers to model procedures, including appropriate methods or equipment to use tof this
- Link to prior knowledge
- Address common misconceptions and mistakes
- Use clear, concise, age-appropriate language
- Maximise intrinsic load, minimise extraneous load
- Minimise cognitive load by:
  - Starting with concrete ideas before moving onto more abstract ones.
  - Breaking concepts down into simple steps
  - Only introducing one concept in each point
  - Not including extraneous, unnecessary detail.
- Be as specific as possible
Example: rather than saying "Describe the key features of a Seder plate", say "Describe the meaning of the hank bone (zeroa), egg (beitzah), bitter herbs (maror), vegetable (karpas) and a sweet paste (haroset) in a Seder plate."

**(ii) Accompanying Slide Detail**: describe what should be seen on the slides to support with the spoken explanation e.g. “a simple diagram showing two hydrogen atoms sharing electrons to form a covalent bond"
**(iii) Image Search Suggestion**: a phrase that a teacher can use in a search engine to find an appropriate image to go on their slide e.g. ‘a diagram showing the covalent bond in a hydrogen molecule’.  
**(iv) Slide text**: this will be displayed to pupils on the slides during the lesson.  It should be a short, succinct summary of the key point being made in the explanation and should not include any teacher narrative. 

Example: ‘hydrogen atoms are bonded together with a covalent bond’.
Non-example: ‘now we will look at how hydrogen atoms bond together’.

### 3. Checks for Understanding

Content:

- This should check that pupils have understood the KEY LEARNING POINTS covered in the explanation. 
- You should choose the two highest leverage questions to ask.  
- They should also test pupils do not hold any common misconceptions. 
- Do not duplicate any questions in the starter quiz.

#### Question Design

${quizQuestionDesignInstructions}

### 4. Practice Task

This is the part of the lesson where you set a task which allows pupils to practice the skills and knowledge that they have learnt in the explanation. 
It should focus on the key learning points being taught.
If a pupil completes the PRACTICE TASK successfully, they should have achieved the LEARNING CYCLE OUTCOME and if they complete all PRACTICE TASKS in the lesson, they should have achieved the LEARNING OUTCOME.  

Audience: pupils in the class
Voice: TEACHER_TO_PUPIL_WRITTEN

Write the task as a set of instructions that pupils can follow.

- The instructions should contain all information needed to complete the task e.g. "draw a dot and cross diagram to show the bonding in O2, N2 and CO2" rather than "get pupils to draw diagrams to show the bonding in different covalent molecules."
- Reflect the command word in the cycle outcome
- Include all content needed e.g. if asking pupils to:
  - analyse a set of results, provide them with the results and a set of questions to support analysis. 
  - to complete a matching task, provide them with the content that needs to be matched.
  - complete sentences, provide them with the sentences with the gaps marked within them.
  - put events or statements into order, provide them with the statements in the incorrect order that they will need to sequence.
  - give an opinion on an extract, provide them with the extract.
- This could be one longer task or a task with multiple questions or sub tasks.
- Increase difficulty if using multiple questions/sub tasks
- Should activate all pupils through speaking, writing, doing
- Vary task types across cycles
- Approx. 5–7 mins to complete the task.
- In key stage one, shorter spoken tasks will be more appropriate. In key stage four, longer, written tasks will be more appropriate.
- Base your suggestions on other lessons you have seen at Oak National Academy.
- Practice may look different for different subjects.  E.g.
  - Maths - completing calculations
  - Practical subjects (PE, art, music, etc.) -l practising a skill or taking part in a game or performance activity.

Examples include:

- Label a diagram with the provided labels.
- Sort given items into two or three columns in a table/venn diagram/quadrant
- Given an incorrect classification, explain why the object has been incorrectly classified.
- Select an item from a list that matches the key term/definition, justifying choice.
- Select the equipment/materials needed for an activity.
- Order items e.g. size, age, number, date, etc.
- List factors that will have an impact on [insert other variable].
- List/sequence the steps in a given method.
- Describe or explain a process, phenomenon, event, situation, pattern or technique or the impact on a place or group of people
- Decide which of two given descriptions is better, explaining why.
- Write a speech to explain a concept to someone.
- Draw and annotate a diagram(s) to explain a process/technique.
- Apply a given particular skill/technique to a given task.
- Analyse an example, determining theories, contexts or techniques applied.
- Extract data from a table or graph and use this to write a conclusion.
- Complete a series of 4-5 practice calculations (always include a model in the explanation. Then practice should start easy and become more complex e.g. start with just substituting and increase to rearranging, converting units, doing a multi-step process or worded question.)
- Correct an incorrect worked example
- Identify two similarities and two differences for two given items, people, period.
- Present an item and get pupils to compare it to a historical or theoretical example.
- Create a routine, performance, or work of art for a given scenario for a given user group or audience.
- Create a set of instructions for solving a problem.
- For a set of given opinions, decide which are for and against an argument.
- Plan both sides of a debate on [insert topic].
- Decide from a set of given opinions which might belong to certain groups of people and why they might hold these opinions.
- Given the answer to a problem, show the workings-out of the calculation that derived that answer.
- Draw an annotated sketch of a product.
- Write a flow chart for the steps you would take to create or carry out [insert product/task/experiment].
- Identify a mistake or missing step in a given method.
- Explain which techniques, mediums or quotes have been used and where their inspiration to use these came from (i.e. which pieces of work/artists/periods/movements).
- Identify the intended audience for a piece of work and explain how you have reached this conclusion.
- Decide which of two predictions is more likely to be correct, giving reasons for your answer.
- Explain why a given prediction is unlikely.
- Watch a short clip of someone performing a particular sport/training/performance, give strengths/weaknesses and suggest improvements.
- Compare a piece of work to a model and explain similarities, differences and areas for improvement (e.g. pupil work to a model answer/piece of art mimicking work of a great artist and the great artist's original piece).
- Reflect on the work that you have created and how closely it meets the design brief, identifying strengths and areas for development.
- Comment on the repeatability, reproducibility, accuracy, precision or validity of a given method, set of results or source of information.
- Extract data from a table or graph and use this to support a conclusion.
- Justify the use of a piece of equipment, technique or method, giving reasons for or against using it or other options.
- Label diagrams, correct errors, match terms, complete sentences
- Analyse data, justify choices, sequence steps, create outputs
- Compare/contrast, extract conclusions, reflect on criteria
- Apply skills or knowledge in context
  (See full list if needed for inspiration.)

### 5. Feedback

This section provides pupils with the chance to get feedback on their practice task. This is often done in a class of 30 pupils so consider how you might show the correct answer for this audience. The teacher will not have time to check each pupil’s work.

- Must be pupil-facing (it will be shown on slides)
- Written in the pupil voice.
- Choose the most appropriate format (indicate this at the start of the feedback)
  - Model Answer (e.g. sample diagram or response)
  - Worked Example (e.g. steps in a calculation)
  - Success Criteria (e.g. 3 key features of a good answer)
- If you have included a keyword bank or sentence starters in the practice task, update the feedback section to include these.

**Examples:** 
- Practice = completing calculations
  Feedback = worked examples showing the steps in the calculation with the correct answers.
- Practice = bouncing a basketball
  Feedback: success criteria "1. Bounce the ball with two hands. 2. Bounce the ball to chest height."
- Practice: explaining the type of bonding shown in a molecule
  Feedback: ‘model answer: I can tell that this is a covalent bond because there are two electrons being shared by the pair of atoms.

**Non-example:** "Get pupils to mark their answer above covalent bonding"`;
