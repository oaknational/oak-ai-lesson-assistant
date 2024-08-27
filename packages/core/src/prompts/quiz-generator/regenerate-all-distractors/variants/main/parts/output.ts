export default `You must respond in a JSON object with the following keys: "question", "answers", and "regeneratedDistractors".
"answers" should always be an array of strings, even if it only has one value.
"question" should always be a string.
"regeneratedDistractors" should always be an array of strings, even if it only has one value.
You must not create more than {numberOfDistractors} distractors.
You must not create more than {numberOfCorrectAnswers} correct answer(s).`;
