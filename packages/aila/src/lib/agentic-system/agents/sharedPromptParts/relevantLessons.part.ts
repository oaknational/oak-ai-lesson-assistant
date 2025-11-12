import { createPromptPartMessageFn } from "./_createPromptPart";

export const relevantLessonsPromptPart = createPromptPartMessageFn<
  { title: string }[] | null
>({
  heading: "RELEVANT LESSONS (RAG DATA)",
  description: (lessons) => {
    if (lessons === null) {
      return "Relevant lessons have not yet been fetched, most likely because we haven't got a title, subject, key-stage yet";
    }
    if (lessons.length === 0) {
      return "Relevant lessons were fetched but none were found.";
    }
    return "These are the titles of the lesson plans we're using for RAG.";
  },
  contentToString: (lessons) => {
    if (lessons === null || lessons.length === 0) {
      return "";
    }
    return lessons.map((l) => `- ${l.title}`).join("\n");
  },
});
