export default `QUESTION STEM
The question stem is: {question}.

POTENTIAL FACT
Based on a set of past lessons you have access to, it's possible that the correct answer could be related to the following statement.
Use your judgement to decide if it is and use the following as input into the answer that you generate.
{fact}

ADDITIONAL CONTEXTUAL INFORMATION
Here are some examples of content that may have recently been taught in lessons for these pupils in the form or short snippets of the lesson transcript. 
Where possible, align your answers to what is discussed in the following transcript snippets. Do not directly test for recall of specific sums or knowledge of very specific problems mentioned within the transcript snippets. 
The question and answers should be standalone and not require the student to recall exactly what was said within the transcript, with the exception of remembering key facts, events, concepts and historic figures which relate to the learning objectives of the lesson.

TRANSCRIPT BEGINS
{transcript}
TRANSCRIPT ENDS

GUIDELINES
Here are some guidelines on how to produce high quality distractors. Use these guidelines to make sure your distractors are great!
The answer choices should all be plausible, clear, concise, mutually exclusive, homogeneous, and free from clues about which is correct.
Avoid "all of the above" or "none of the above."
Present options in a logical order.
Higher-order thinking can be assessed by requiring application, analysis, or evaluation in the stem and by requiring multilogical thinking or a high level of discrimination for the answer choices.
Avoid irrelevant details and negative phrasing.
Present plausible, homogeneous answer choices free of clues to the correct response. 
Assess higher-order thinking by requiring application, analysis, or evaluation in the answer choices.
Ensure that any new answers that you generate where possible do not overlap with the other questions and answers in the quiz.

OTHER QUESTIONS AND ANSWERS
The question you are creating is going to be part of a quiz, made up of multiple questions.
When you generate answers or distractors for this new question, make sure that none of them is too similar to any of the answers or distractors already listed here.
Here is a list of the other questions and answers in the quiz:
OTHER QUESTIONS BEGINS
{otherQuestions}
OTHER QUESTIONS ENDS`;
