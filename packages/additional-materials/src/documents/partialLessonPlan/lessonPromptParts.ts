export const lessonPlanPromptParts = {
  title: `TITLE
  The title of the lesson should be a short, descriptive phrase that captures the main focus of the lesson.
  It should be no more than 10 words long and should be appropriate for the key stage and subject being taught.
  The title should be engaging and relevant to the pupils, and it should give them a clear idea of what they will be learning in the lesson.
  It should be specific enough to guide the lesson's content and activities, but not so narrow that it limits the scope of the lesson.`,
  keyStage: `KEY STAGE
  The Key Stage is the stage of education that the lesson is aimed at.
  In the UK, there are four key stages:
  - Key Stage 1 (KS1): Ages 5-7 (Years 1-2)
  - Key Stage 2 (KS2): Ages 7-11 (Years 3-6)
  - Key Stage 3 (KS3): Ages 11-14 (Years 7-9)
  - Key Stage 4 (KS4): Ages 14-16 (Years 10-11)
  The Key Stage should be appropriate for the subject and age group of the pupils.`,
  subject: `SUBJECT
  The subject is the area of study that the lesson is focused on.
  `,

  learningOutcome: `LESSON LEARNING OUTCOME
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
  `,
  learningCycles: `LEARNING CYCLES
  This is where the Lesson Learning Outcome is broken down into manageable chunks for pupils.
  They are statements that describe what the pupils should know or be able to do by the end of the lesson.
  Typically, there are no more than two or three of these, and they map one-to-one to the numbered Learning Cycles that the lesson includes.
  These should be phrased as commands starting with a verb (e.g. Name, Identify, Label, State, Recall, Define, Sketch, Describe, Explain, Analyse, Discuss, Apply, Compare, Calculate, Construct, Manipulate, Evaluate).
  For example, "Recall the differences between animal and plant cells" or "Calculate the area of a triangle".
  The word limit for each of these is 20 words and no more.
  They should increase in difficulty as the lesson progresses.`,

  priorKnowledge: `PRIOR KNOWLEDGE
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
  `,
  keyLearningPoints: `KEY LEARNING POINTS
  The key learning points are the most important things that the pupils should learn in the lesson.
  These are statements that describe in more detail what the pupils should know or be able to do by the end of the lesson.
  These factually represent what the pupils will learn rather than the overall objectives of the lesson.
  The key learning points should be succinct, knowledge-rich, factual statements.
  For example, describing what will be learned is incorrect: "The unique features of plant cells, including cell walls, chloroplasts, and large vacuoles".
  This example should instead appear as "A plant cell differs from an animal cell because it has a cell wall, chloroplast and a large vacuole".
  `,
  misconceptions: `MISCONCEPTIONS
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
  The misconception response should be no longer than 250 characters.`,
  keywords: `KEYWORDS
  These are significant or integral words which will be used within the lesson.
  Pupils will need to have a good understanding of these words to access the lesson's content.
  They should be Tier 2 or Tier 3 words.
  Tier 2 vocabulary is academic vocabulary that occurs frequently in text for pupils but is not subject-specific. Examples include "beneficial," "required," and "explain."
  Tier 3 vocabulary occurs less frequently in texts but is subject-specific. For example, "amplitude" or "hypotenuse".
  When giving the definition for each keyword, make sure that the definition is age-appropriate and does not contain the keyword itself within the Explanation.
  For example, "Cell Membrane": "A semi-permeable membrane that surrounds the cell, controlling the movement of substances in and out of the cell."
  Try to make your definitions as succinct as possible.
  The definition should be no longer than 200 characters.
  `,
  starterQuiz: `STARTER QUIZ
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
  `,
  // cycle1: CycleSchema.describe("The first learning cycle"),
  // cycle2: CycleSchema.describe("The second learning cycle"),
  // cycle3: CycleSchema.describe("The third learning cycle"),
  exitQuiz: `EXIT QUIZ
  The Exit Quiz at the end of the lesson should check the pupils' understanding of the topics covered in the lesson.
  If a pupil has correctly completed the Exit Quiz, they have understood the key learning points and misconceptions or common mistakes in the lesson.
  The Exit Quiz should test the pupils only on the concepts introduced in the lesson and not the prior knowledge.
  The Exit Quiz should be six questions long.
  It should get harder as pupils go through.
  It should include one question that tests pupils on their understanding of one of the keywords.
  `,
};
