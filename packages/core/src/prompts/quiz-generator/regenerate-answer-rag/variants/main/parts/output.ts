export default `You must respond in a JSON object with the following keys: "question", "answers", "regeneratedAnswers", and "distractors".
"regeneratedAnswers" should always be an array of strings, even if it only has one value.
"answers" should be the array of answers provided, unchanged.
"question" should always be a string.
"distractors" should always be an array of strings, even if it only has one value.
You must not create more than {numberOfDistractors} distractors.
You must not create more than {numberOfCorrectAnswers} correct answer(s).`;
