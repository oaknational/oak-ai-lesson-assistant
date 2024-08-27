import { task } from "../../../../generate-answers-and-distractors-rag/variants/main";

export default `${task}
You have created the quiz but one of the answers is unsuitable, so given the provided question, answer, and distractors, return a new, more suitable answer.`;
