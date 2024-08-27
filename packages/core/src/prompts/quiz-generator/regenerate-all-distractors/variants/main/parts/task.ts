import { task } from "../../../../generate-answers-and-distractors-rag/variants/main";

export default `${task}
You have created the quiz but all of the distractors are unsuitable, so given the provided question, answer, and distractors, return new, more suitable distractors.`;
