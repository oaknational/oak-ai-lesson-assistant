import { TemplateProps } from "..";

export const body = ({ lessonPlan, responseMode }: TemplateProps) => {
  const { keyStage } = lessonPlan ?? {};
  return `HOW TO WRITE A GOOD LESSON PLAN
A well-thought-out lesson plan should:
* Be age-appropriate for pupils studying in the UK${
    keyStage ? ` at Key Stage ${keyStage}` : ""
  }.
* Include the key learning points to take away from the lesson
* Identify and check for pupils' prior knowledge during a starter quiz. We need to be sure that the pupils know certain things before we can teach them something new based on that knowledge.
* Address common misconceptions about the topic
* Include some engaging activities to help reinforce the learning points.
* Include some checks for understanding and an exit quiz to allow the teacher to check what pupils have learned during the lesson.

Ensure that the keywords relevant to the topic are repeated throughout the different sections of the lesson plan.
Consider what makes a good lesson for children of the given age range, taking into account what they will have already covered in the UK curriculum.
Put thought into how the different sections of the lessons link together to keep pupils informed and engaged.

LESSON LEARNING OUTCOME
The Lesson Learning Outcome describes what the pupils will have learned by the end of the lesson.
This should be phrased from the point of view of the pupil, starting with "I can…".
The word limit for this is 30 words and no more.
The learning outcome is the main aim of the lesson and should be the first thing the teacher writes when planning a lesson.
It should be clear and concise and should be the lesson's main focus.
It should be achievable within the lesson's time frame, which is typically 50 minutes for key stages 2, 3, and 4 and 40 minutes for key stage 1.
If the title of the proposed lesson is very broad, for instance, "World War 2" or "Space", the learning outcome you generate should be something specifically achievable within this time frame.
You should also narrow down the title of the lesson to match the learning outcome.
An individual lesson would often sit within a broader scheme of work or unit of work.
As such, it is important that the learning outcome is specific to the lesson and not the broader topic.
If the topic that the user has suggested is very broad, you may ask a follow-up question to narrow down the focus of the lesson, and then decide on a learning outcome.
You may also want to offer some options for the Learning Outcome, and allow the user to choose the one that they think is most appropriate.

LEARNING CYCLES
This is where the Lesson Learning Outcome is broken down into manageable chunks for pupils.
They are statements that describe what the pupils should know or be able to do by the end of the lesson.
Typically, there are no more than two or three of these, and they map one-to-one to the numbered Learning Cycles that the lesson includes.
These should be phrased as commands starting with a verb (e.g. Name, Identify, Label, State, Recall, Define, Sketch, Describe, Explain, Analyse, Discuss, Apply, Compare, Calculate, Construct, Manipulate, Evaluate).
For example, "Recall the differences between animal and plant cells" or "Calculate the area of a triangle".
The word limit for each of these is 20 words and no more.
They should increase in difficulty as the lesson progresses.

PRIOR KNOWLEDGE
The prior knowledge section should describe the most relevant and recent knowledge that the pupils should already have before starting the lesson.
This should be phrased as a list of knowledge statements (Substantive, Disciplinary or Procedural).
Each item should be no more than 30 words.
There should be no more than five items in this list.
Do not start each item with "Pupils…". Just go straight to the statement.
It should be the actual fact that the pupils should know.
For instance:
- The Earth is round.
- A forest is a large area of land covered in trees.
- A verb is a word that describes an action.
Make sure that whatever is expected of the pupils is appropriate for their age range and the Key Stage they are studying.
Do not include anything too advanced for them.
Use language and concepts that are appropriate.
Base your answer on other lesson plans or schemes of work that you have seen for lessons delivered in UK schools.

KEY LEARNING POINTS
The key learning points are the most important things that the pupils should learn in the lesson.
These are statements that describe in more detail what the pupils should know or be able to do by the end of the lesson.
These factually represent what the pupils will learn rather than the overall objectives of the lesson.
The key learning points should be succinct, knowledge-rich, factual statements.
For example, describing what will be learned is incorrect: "The unique features of plant cells, including cell walls, chloroplasts, and large vacuoles".
This example should instead appear as "A plant cell differs from an animal cell because it has a cell wall, chloroplast and a large vacuole".

MISCONCEPTIONS
Misconceptions are incorrect beliefs about a topic or subject.
It is important for a teacher to be aware of these before they start teaching a lesson because they should try to address these with pupils during the explanation.
Checks for understanding, practice tasks and quizzes should enable the teacher to check whether pupils have these misconceptions about a topic so that they can correct them if they do.
The misconception and response should be written as a succinct sentence.  
You should then include a misconception response which says how the misconception should be addressed. 
For example, a common misconception in maths is that "multiplying two numbers always produces a bigger number".
The correction to this misconception could be, "Multiplying by less than one or a negative can result in a smaller number, and multiplying by zero will result in an answer of zero."
You can provide between 1 and 3 misconceptions.  
Only provide corrections that are factually correct, not based on just opinion.
The misconception should be no longer than 200 characters.  
The misconception response should be no longer than 250 characters.

KEYWORDS
These are significant or integral words which will be used within the lesson.
Pupils will need to have a good understanding of these words to access the lesson's content.
They should be Tier 2 or Tier 3 words.
Tier 2 vocabulary is academic vocabulary that occurs frequently in text for pupils but is not subject-specific. Examples include "beneficial," "required," and "explain."
Tier 3 vocabulary occurs less frequently in texts but is subject-specific. For example, "amplitude" or "hypotenuse".
When giving the definition for each keyword, make sure that the definition is age-appropriate and does not contain the keyword itself within the Explanation.
For example, "Cell Membrane": "A semi-permeable membrane that surrounds the cell, controlling the movement of substances in and out of the cell."
Try to make your definitions as succinct as possible.
The definition should be no longer than 200 characters.

QUIZZES
The lesson plan should begin with a Starter Quiz and end with an Exit Quiz.
${
  responseMode === "interactive"
    ? `Only generate these when requested in the instructions.
`
    : ""
}
STARTER QUIZ
The Starter Quiz, presented to pupils at the start of the lesson, should check the pupils' prior knowledge before the lesson begins.
The Starter Quiz should be based on the prior knowledge and potential misconceptions only within the prior knowledge.
Do not test pupils on anything that is contained within the lesson itself.
Imagine a pupil begins the lesson and knows about the things listed in the prior knowledge section.
The teacher delivering the lesson wants to make sure that all of the pupils know the required knowledge listed in the prior knowledge section before starting the lesson so that all pupils start the lesson from a point where they already know these foundational concepts.
If the pupils don't know these things, they will struggle with the lesson, so the teacher wants to ask a series of questions to check what the pupils know before starting the lesson.
This is the purpose of the Starter Quiz, so it is important we get it right!
The contents of the Starter Quiz should be questions that test the PRIOR KNOWLEDGE as defined in the lesson plan.
Never test the pupils on the lesson's content for the STARTER QUIZ.
For instance, if the lesson introduces a new concept B, the Exit Quiz should test the pupils on that concept B.
If the lesson has prior knowledge A, the Starter quiz should test the pupils on that prior knowledge A.
The Starter Quiz should not mention B in any way.
It should be six questions long.
It should get harder as they go through.
You are aiming for the average pupil to answer five out of six questions correctly.
Remember: do not test the pupil on what the lesson covers. Test them on the prior knowledge they should have before starting the lesson!

EXIT QUIZ
The Exit Quiz at the end of the lesson should check the pupils' understanding of the topics covered in the lesson.
If a pupil has correctly completed the Exit Quiz, they have understood the key learning points and misconceptions or common mistakes in the lesson.
The Exit Quiz should test the pupils only on the concepts introduced in the lesson and not the prior knowledge.
The Exit Quiz should be six questions long.
It should get harder as pupils go through.
It should include one question that tests pupils on their understanding of one of the keywords.

HOW TO MAKE A GOOD QUIZ
A quiz comprises one or more correct answers and one or more "distractor" answers that should be subtly incorrect.
It should be engaging and suitably challenging for the given age range.
Consider the level of detail the given subject will have been taught at for the age range, and the level of reading when deciding on suitable responses.
Compared to the answer, the distractors should sound plausible and be of a similar length to the correct answer(s), but with some consideration, a pupil in the given age range should be able to identify the correct answer.
Consider working common misconceptions into the quiz distractors.
Never use negative phrasing in the question or answers.
For instance, never produce a question starting with "Which of these is not…".
Generally these negative questions are confusing for pupils.
Do not include "true or false" questions.

HOW TO COME UP WITH GOOD PLAUSIBLE DISTRACTORS
Here are some guidelines on how to produce high-quality plausible distractors. Use these guidelines to make sure your plausible distractors are great!
The answer choices should all be plausible, clear, concise, mutually exclusive, homogeneous, and free from clues about which is correct.
Avoid "all of the above" or "none of the above".
No plausible distractor should ever be the same as the correct answer.
Higher-order thinking can be assessed by requiring application, analysis, or evaluation in the stem and by requiring multilogical thinking or a high level of discrimination for the answer choices.
Avoid irrelevant details and negative phrasing.
Present plausible, homogeneous answer choices free of clues to the correct response.
Assess higher-order thinking by requiring application, analysis, or evaluation in the answer choices.
Ensure that any new answers that you generate, where possible, do not overlap with the other questions and answers in the quiz.
Good plausible distractors should be similar in length to the correct answer. They can sometimes be a little shorter or longer, but they should not be significantly different in length.

For example, the following would not be a good set of plausible distractors because due to its length the answer is easy to guess:

What is the periodic table?
* a table that lists periods
* an old wooden table
* a table that shows every known element that has been discovered

Continuing the example, the following would be a good set of plausible distractors:

What is the periodic table?
* a table that lists all chemical compounds
* a table that shows all chemical reactions
* a table that shows all known elements

Wherever plausible distractors are mentioned, for instance, in the quizzes and the checks for understanding, follow these guidelines to ensure that the distractors are of high quality.

LEARNING CYCLES
Based on the overall plan, and only when requested, you will create two or three Learning Cycles that describe in more detail how the lesson should be structured.
The first time that you mention Learning Cycles in conversation with the user, please explain what they are. 
For example, "Learning Cycles are how Oak structures the main body of the lesson, they include an explanation, some checks for understanding, a practice task and some feedback".
The main body of the lesson is delivered in these cycles.
A Learning Cycle is defined as a sequence of an Explanation, interspersed with Checks for Understanding and Practice, with accompanying Feedback, that together facilitate the teaching of knowledge.
A Learning Cycle should last between 10-20 minutes.
The whole lesson should take 50 minutes in total.
The Learning Cycles should total 45 minutes because the teacher will spend approximately 5 minutes on the starter and Exit Quiz.
Rather than writing about what a teacher should generally do when delivering a lesson, you want to write about what you specifically want to do when delivering this lesson.
You want to write about the specific content you want to teach and the specific checks for understanding and practice you want to use to teach it.
You can assume that the audience is familiar with the subject matter, so you can focus on explaining how you want to teach it.
For each Learning Cycle, you want to write about the following:
Explanation: This is the first phase of a Learning Cycle.
It aims to communicate the key points/concepts/ideas contained in the Learning Cycle in a simple way.
There are two elements of an explanation: the spoken teacher explanation and the accompanying visual elements.
Visual elements are diagrams, images, models, examples, and (limited) text that the teacher will use on the slides.

LEARNING CYCLES: SUBSECTION RULES:
Make sure to follow the following rules that relate to particular subsections within each Learning Cycle.
It's very important that you adhere to the following rules because each Learning Cycle must adhere to these requirements to be valid.

LEARNING CYCLES: TEACHER EXPLANATION:
The spoken teacher explanation must be concise and should clearly state the concepts and knowledge the teacher must explain during that Learning Cycle.
It is directed to the teacher, telling them the key concepts that they will need to explain during this section of the lesson.
You can suggest analogies, examples, non-examples, worked examples, relevant stories from history or the news.
You can indicate appropriate opportunities for discussion by posing a question.
You should suggest appropriate moments and methods for the teacher to model or demonstrate procedural knowledge (this should be broken down into steps). 
If artefacts such as a globe or a hat would be useful for teachers to use in their explanation, you can indicate this during this section of the Explanation.
It should always be optional to have this artefact.
Good verbal explanations should link prior knowledge to new knowledge being delivered.
Be as specific as possible as the teacher may not have good knowledge of the topic being taught.
E.g. rather than saying "Describe the key features of a Seder plate", say "Describe the meaning of the hank bone (zeroa), egg (beitzah), bitter herbs (maror), vegetable (karpas) and a sweet paste (haroset) in a Seder plate."
Typically, this should be five or six sentences or about 5-12 points in the form of a markdown list.
Make sure to use age-appropriate language.
Explanations should minimise extraneous load and optimise intrinsic load.
You will also provide the information for the visual part of the Explanation.
This will include the Accompanying slide details, an Image search suggestion and the Slide text.

LEARNING CYCLES: ACCOMPANYING SLIDE DETAILS:
This should be a description of what the teacher should show on the slides to support their spoken teacher explanation.
For example, "a simple diagram showing two hydrogen atoms sharing electrons to form a covalent bond".

LEARNING CYCLES: IMAGE SEARCH SUGGESTION:
This should give teachers a phrase that they can use in a search engine to find an appropriate image to go onto their slides.
For example, "hydrogen molecule covalent bond".

LEARNING CYCLES: SLIDE TEXT:
This will be the text displayed to pupils on the slides during the lesson.
It should be a summary of the key point being made during the explanation. 
For example, "An antagonistic muscle pair has one muscle which contracts whilst the other muscle relaxes or lengthens."
This should not include any teacher narrative.
For example, this would be incorrect as slide text: "Now we will look at the antagonistic muscle pairs... "

LEARNING CYCLES: CHECKS FOR UNDERSTANDING:
A Check For Understanding follows the explanation of a key learning point, concept or idea.
It is designed to check whether pupils have understood the explanation given.
Produce two Check For Understanding questions in each Learning Cycle.
These should be multiple-choice questions, with one correct answer and two plausible distractors, that test for common misconceptions or mistakes.
Try to test whether pupils have understood the knowledge taught rather than just their ability to recall it.
For example, it would be better to ask: "Which of these is a prime number?" "4, 7, 10?" rather than "What is the definition of a prime number?" "numbers divisible by only one other number, integers divisible by only 1 and the number itself, odd numbers divisible by only 1 and the number itself".
Write the answers in alphabetical order.
The questions should not be negative. For example, do not ask, "Which of these is NOT a covalent bond?"
Answers should also not include "all of the above" or none of the above".
The Check For Understanding questions should not replicate any questions from the Starter Quiz.
Do not use "true or false" questions to Check For Understanding.

LEARNING CYCLES: PRACTICE TASKS
During the practice section of a Learning Cycle, you set a task for pupils that will help them practice the knowledge or skill that they have learned during the Explanation.
Your instructions for this part of the lesson should be pupil-facing and specific and include all of the information that pupils will need to complete the task e.g. "Draw a dot and cross diagram to show the bonding in O2, N2 and CO2" rather than "get pupils to draw diagrams to show the bonding in different covalent molecules."
You should provide everything in your instructions that the pupils will need to be able to complete the practice task.
For example, if you are asking pupils:
* to analyse a set of results, provide them with the results and the set of questions that will help them to complete their analysis.
* to complete a matching task, provide them with the content that needs to be matched.
* to complete sentences, provide them with the sentences with the gaps marked within them.
* to put events or statements into order, provide them with the statements in the incorrect order that they will need to sequence.
* to give an opinion on an extract, provide them with the extract.

The practice should increase in difficulty if you are asking pupils to do more than one example/question.
In the example given, the dot-and-cross diagram for CO2 is much more challenging than the dot-and-cross diagram for O2.
Practice is essential for securing knowledge, and so this is the most important part of the lesson to get right.
The practice should be linked to the Learning Cycle outcomes that you set at the start of the lesson plan.
The practice task should take up the majority of the time in the Learning Cycle.
Ensure that the Explanation, Checks for understanding, Practice task, and Feedback can be completed in the time allocated to the Learning Cycle. 
Typically the practice task should take between five and ten minutes.
Asking the pupils to create a newspaper article and present it to the class is not possible in fifteen minutes!
Be realistic about what can be achieved in the time limit.
Base your suggestions on other lesson plans that you have seen for lessons delivered in UK schools.
The practice task for each Learning Cycle should be different to ensure that there is a variety of activities for pupils in the lesson.
Practice might look very different for some subjects.
In maths lessons, this will normally be completing mathematical calculations, it will normally include giving spoken or written answers.
In more practical subjects, such as PE, Art, Music, etc., it might involve a pupil practising a skill or taking part in a game or performance activity.
Practice tasks should allow pupils the opportunity to practice the knowledge that they have learnt during the explanation.
It should force all pupils in the room to be active learners, contributing in some way, either verbally or physically, through writing, drawing, or creating.
If a pupil correctly completes the practice task, they have mastered the key learning points for that Learning Cycle.
For a practice task to be effective, it needs to be specific enough to ensure the desired knowledge is being practised.
The Learning Cycle outcome will include a command word, and this should direct you to the most appropriate practice task from this list of example tasks:

STARTING EXAMPLE TASKS
Label a diagram with the provided labels.
Circle a word or picture that matches the given description.
Sort given items into two or three columns in a table.
Sort given items into a Venn diagram.
Sort given items into four quadrants based on a scale of two properties.
Explain why a given item is hard to classify.
Provided with an incorrect classification, explain why the object has been incorrectly classified.
Match given key terms to given definitions.
Fill in the gaps in a sentence to complete a definition.
Finish a sentence to complete a definition.
Select an item from a list or set of pictures that matches the key term or definition and justify your choice.
Correct an incorrect definition given.
List the equipment/materials needed for an activity.
List given items in order of size, age, number, date, etc.
List [insert number] of factors that will have an impact on [insert other thing].
List the steps in a given method.
Identify an item on a given list that does not belong on the list and give a reason for your decision.
Correct an incorrectly ordered list.
Fill in the gaps in a sentence to complete a description or explanation of a process, phenomenon, event, situation, pattern or technique.
Finish a sentence or paragraph to complete a description or explanation of a process, phenomenon, event, situation, pattern or technique.
Decide which of two given descriptions/answers/responses is better and explain why.
Order steps/parts of an explanation/method into the correct order.
Write a speech to explain a concept to someone.
Draw and annotate a diagram(s) to explain a process/technique.
Explain the impact of a process, phenomenon, event, situation, pattern or technique on a person, group of people or the environment.
Apply a given particular skill/technique to a given task.
Choose the most appropriate item for a given scenario and justify why you have chosen it.
Apply a skill that has been taught to complete a practice calculation (should begin with a simple application and then progress to more complex problems, including worded questions).
When given an example, determine which theories, contexts or techniques have been applied.
Extract data from a table or graph and use this to write a conclusion.
Complete a series of 4-5 practice calculations (when asking pupils to complete a calculation, there should always be a model in the explanation section of the lesson, the practice task should always start from easy, just requiring substitution into an equation or scenario, to more complex, where pupils are asked to rearrange an equation, convert units or complete an additional step. Each time, a challenge question should be provided, which is a scenario-based worded problem with age-appropriate language).
Present an incorrect worked example for a calculation and get pupils to correct it or spot the error.
Present two items and get pupils to identify two similarities and two differences.
Present an item and get pupils to compare it to a historical or theoretical example.
Complete sentences to compare two things, for example, Duncan and Macbeth - two characters from Macbeth or animal and plant cells. The sentences should miss out the more important piece of knowledge for pupils to recall or process. For example, what the actual difference between them is.
Present two items and get pupils to identify two differences.
Present an item and get pupils to identify differences between the item and a historical or theoretical example.
Complete sentences describing the differences between two items (e.g. Duncan and Macbeth - two characters from Macbeth or animal and plant cells).
The sentences should miss out the more important piece of knowledge for pupils to recall or process, such as the actual difference between them.
Create a routine, performance, or work of art for a given scenario for a given user group or audience.
Create a set of instructions for solving a problem.
Given a set of different opinions, decide which are for and against an argument.
Given an opinion, write an opposing opinion.
Plan both sides of a debate on [insert topic].
Decide from a set of given opinions which might belong to certain groups of people and why they might hold these opinions.
Given a list of facts, write arguments for or against a given scenario.
Given the answer to a problem, show the workings-out of the calculation that derived that answer.
Draw an annotated sketch of a product.
Write a flow chart for the steps you would take to create or carry out [insert product/task/experiment].
Put steps in order to create/carry out [insert product/task/experiment].
Identify a mistake or missing step in a given method.
Fill in the gaps in a sentence to complete an interpretation or give the reasons for a quote, set of results, event, situation or pattern.
Finish a sentence to complete an interpretation or give the reasons for a quote, set of results, event, situation or pattern.
Explain how an image relates to the topic being discussed.
Explain which techniques, mediums or quotes have been used and where their inspiration to use these came from (i.e. which pieces of work/artists/periods/movements).
Identify the intended audience for a piece of work and explain how you have reached this conclusion.
Decide which of two predictions is more likely to be correct, giving reasons for your answer.
Fill in the gaps in a sentence to make a prediction.
Finish a sentence to make a prediction.
Explain why a given prediction is unlikely.
Match the given predictions to given scenarios.
Watch a short clip of someone performing a particular sport/training/performance, give strengths/weaknesses and suggest improvements.
Describe the similarities and differences between the work of different experts in the given subject. E.g. Monet and Picasso.
Compare a piece of work to a model and explain similarities, differences and areas for improvement (e.g. a piece of pupil work to a model answer or a piece of art designed to mimic the work of a great artist and the great artist's original piece).
Reflect on the work that you have created and how closely it meets the design brief, identifying strengths and areas for development.
Ask pupils to comment on the repeatability, reproducibility, accuracy, precision or validity of a given method, set of results or source of information.
Extract data from a table or graph and use this to support a conclusion.
Justify the use of a piece of equipment, technique or method, giving reasons for or against using it or other options.
Fill in the gaps in a sentence by giving the reasons for a quote, set of results, decision, event, situation or pattern.
Finish a sentence to give the reasons for a quote, set of results, event situation or pattern.
ENDING EXAMPLE TASKS

LEARNING CYCLES: FEEDBACK
The feedback section of a Learning Cycle allows pupils to receive feedback on their work and see the correct or a model answer.
As this is often done in a class of thirty pupils, you might provide a model answer e.g. a good example of a labelled diagram or a well-written paragraph or a correctly drawn graph.
If possible, an explanation should be given as to why this is the correct answer.
If the practice task involves a calculation(s), the feedback could be a worked example with the correct answers.
In other situations, it may be more appropriate to provide a list of success criteria for a task the teacher or pupil can use to mark their own work against.
If none of these formats are appropriate, you should give very clear instructions for the teacher about how they will provide feedback to the pupil.
For example, if pupils have completed a set of calculations in the practice task, the feedback should be a set of worked examples showing the steps in the calculation with the correct answers.
If the task is practising bouncing a basketball, then the feedback should be a set of success criteria such as "1. Bounce the ball with two hands. 2. Bounce the ball to chest height."
Before giving feedback, you should indicate whether you are providing a "worked example," "model answer," or "success criteria."
The feedback should be pupil-facing because it will be displayed directly on the slides. 
For example, "Model answer: I can tell that this is a covalent bond because there are two electrons being shared by the pair of atoms" rather than "Get pupils to mark their answer above covalent bonding".
You should decide which is the most appropriate form of feedback for the specific practice task.

END OF RULES FOR LEARNING CYCLES

ADDITIONAL MATERIALS
For some lessons, it may be useful to produce additional materials when the user requests it.
This is a free-form markdown section with a maximum H2 heading (Eg. ##).
This section could include:
* a case study context sheet (including details on location/historical context/short-term and long-term causes/effects/impacts)
* additional questions for homework practice.
* practical instructions to support a teacher in running an experiment that you have suggested in the lesson (a list of equipment required, methods, safety instructions and potentially, model results).
* suggestions of ways of adapting a teacher's delivery for the SEND pupils they have told you they have in their class.
* a piece of text that you have asked pupils to read/analyse during the practice task (if it is longer than 30 words so it won't fit on a PowerPoint slide in a reasonable font)
* a narrative (written as a script) to support the teacher in delivering a tricky explanation.
* suggestions for warm-up or cool-down activities for a PE lesson.
* suggestions for alternative equipment/case studies/examples.
* a translation of keywords into another language (always provide the keyword and definition in English, and then the keyword and definition in the requested language and remind teachers to check translations carefully).
or anything else that would be appropriate for supporting a teacher in delivering a high-quality lesson.
If a narrative is chosen for the additional materials, this should be written as a script for the teacher to use.
It should include the factual information and key learning points that the teacher is going to impart.
Write the narrative as if the teacher is speaking to the pupils in the classroom. 
It should be specific and include analogies and examples where appropriate. 
Underneath the narrative, include the main things the teacher should include in their Explanation as bullet points.
If you include a narrative, you should ask the teacher if they have a preference for the specific content before creating the additional materials.
For example, if the lesson is about different creation stories, you should ask whether there are any particular creation stories that they want to include, e.g. the Christian creation story.
The additional materials may also include search terms to find relevant diagrams or images where appropriate.
For example, for pupils in a Maths lesson to practice counting or for a pupil in an Art lesson to be able to annotate an image of a painting to show different techniques used.
Additional materials may also include a text extract for pupils to read with accompanying questions.
This is if the text is too long for pupils to read from the PowerPoint slides - more than 30 words.
If the user wants you to do so, produce a narrative that they can use for this lesson plan.
The narrative should be written as if the teacher is speaking to the pupils in the classroom. It should be specific and include analogies and examples where appropriate. Underneath the narrative, include the main things the teacher should include in their Explanation.
If a user asks to add additional practice questions to the additional materials, you should include a set of at least 10 extra questions. These must not repeat questions already used in the lesson.
These should increase in difficulty as the question number increases. If possible, include the number of marks allocated to each question. 
You should provide all instructions in this section to enable pupils to be able to complete these additional questions.
You should also include a set of answers. If the additional questions are calculations, you should include a list of answers and a list of worked examples.
If you are giving questions that require short answers, you should give a mark scheme with possible correct answers.  If you are including an extended writing question, you should include a list of marking criteria or success criteria that you would expect to see in the answer as well as a model answer.
If a user asks to translate the keywords into another language, you should first of all ask which language they would like the keywords to be translated into. 
In the additional materials, you should then give the keyword with its English definition and then, underneath, the keyword in the requested language with its definition in that language.
This is to support pupils with learning the English word and definition.  E.g. “increase: to make something bigger or more. "Augmenter : rendre quelque chose plus grand ou plus.”
If a user asks to add practical instructions for an additional material and the lesson is a science lesson, you should include the following sections:

1. Purpose of the practical - written in voice 5 (EXPERT_TEACHER)
2. Teacher notes (to highlight anything they should be aware of in terms of using equipment or things that pupils might find challenge/might go wrong) - **written in voice 5 (EXPERT_TEACHER)
3. Equipment - written as a bullet point list. Be specific with quantities of chemicals if applicable.
4. Method - written as step by step instructions with all of the information needed to complete the practical.
5. Results table (with space for three sets of results and a mean if appropriate)
6. Sample results (in a results table - it should have three repeats with a mean calculated if appropriate).
7. Health and safety guidance  - written in voice 5 (EXPERT_TEACHER)
8. Risk assessment (a fixed statement - “A risk assessment should be completed before undertaking any science practical work or demonstrations. The information outlined in this guidance contains advice for how to work safely in and out of the classroom, however, risk assessments are the responsibility of the individual school. Please contact a local or wider advisory service, such as CLEAPSS, on all aspects of health and safety for further support.

If there are no additional materials to present, respond with just the word None. Only generate additional materials when the user specifically requests them in the instructions.`;
};
