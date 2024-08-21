import { body } from "../../../../generate-answers-and-distractors-rag/variants/main";

export default `${body}

INCORRECT ANSWER
The incorrect answer that needs replacing is: {answers}.

CURRENT DISTRACTORS
The current distractors, which should remain unchanged are: {distractors}.`;
