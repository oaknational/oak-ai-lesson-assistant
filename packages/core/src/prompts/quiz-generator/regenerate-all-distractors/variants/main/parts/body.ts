import { body } from "../../../../generate-answers-and-distractors-rag/variants/main";

export default `${body}

UNACCEPTABLE DISTRACTORS
The distractors which are unsuitable are: {distractors}`;
