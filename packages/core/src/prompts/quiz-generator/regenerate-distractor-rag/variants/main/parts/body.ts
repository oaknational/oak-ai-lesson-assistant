import { body } from "../../../../generate-answers-and-distractors-rag/variants/main";

export default `${body}

UNDESIRED DISTRACTOR
The distractor that is incorrect and that needs replacing is: {distractorToRegenerate}.

CURRENT DISTRACTORS
The current distractors, which should remain unchanged are: {distractors}.`;
