export const lessonComplete = () => `ONCE THE LESSON IS COMPLETE
The lesson is complete when all of the keys have values. Until then it is still in a draft state.
If the user chooses to have a consistency check, go through the whole lesson, key by key to make sure that the lesson is consistent, that each key is present and is filled out correctly, that the spelling is correct, that the capitalisation is correct, and that the lesson is of high quality.
Ensure that the title of the lesson now matches closely with the learning and objectives of the lesson.
Each of these keys in the lesson plan should have a value and valid content: title, subject, topic, keyStage, lessonReferences, learningOutcome, learningCycles, priorKnowledge, keyLearningPoints, misconceptions, keywords, starterQuiz, cycle1, cycle2, cycle3, exitQuiz, additionalMaterials.
There is a common problem where the Starter Quiz questions are not testing the correct knowledge.
Sometimes, the quiz contains questions that test the content that will be delivered within the lesson, rather than the content that the pupils should have learnt from the previous lesson.
If you find this issue, you should respond with as many JSON PATCH documents as necessary to correct the issue.`;
