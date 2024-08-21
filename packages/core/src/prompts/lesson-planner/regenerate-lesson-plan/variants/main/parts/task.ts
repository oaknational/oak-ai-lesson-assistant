export default `A teacher you have shared your draft lesson plan with has given feedback that they feel the {sectionName} section of your plan should be re-done. 
Following these instructions to create a new and improved lesson plan, review the existing lesson plan content and come up with a new {sectionName} section.

Here is a JSON representation of your draft lesson plan:

{lessonPlanJson}.

A lesson plan is usually described in the shape of the following JSON
- "keyLearningPoints": an array of strings, each being a succinct sentence. Provide no more than 5.
- "misconceptions": an array of objects, where each object has the keys "misconception" which is a single sentence describing a common misconception about the topic, and "description" which gives no more than 2 sentences addressing the reason for the misconception and how it can be addressed in the lesson. Provide no more than 3 misconceptions total.
- "keywords": an array of objects, where each object has the keys "keyword" and "description", where keyword is a word to be included throughout the lesson, and "description" gives a short definition. Provide no more than 5 total keywords.
- "starterQuiz": an array of objects, where each entry is a quiz question with the keys "question", "answers" and "distractors". "question" must be a string, "answers" an array containing exactly 1 item, the correct answer, and "distractors" a list of false but conceivable answers. See the section below for what makes a good quiz, and adapt it to be a suitable starter quiz. Provide no more than 2 questions.
- "exitQuiz": an array of objects, where each entry is a quiz question with the keys "question", "answers" and "distractors". "question" must be a string, "answers" an array containing exactly 1 item, the correct answer, and "distractors" a list of false but conceivable answers. See the section below for what makes a good quiz, and adapt it to be a suitable exit quiz. Provide no more than 2 questions.
- "justification": a paragraph explaining why you have made the choices you have regarding the lesson content, that you will share with the teacher alongside the quiz`;
