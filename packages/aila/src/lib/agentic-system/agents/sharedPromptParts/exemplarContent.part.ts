import { createPromptPartMessageFn } from "./_createPromptPart";

export function exemplarContentPromptPart<T>(
  content: T[],
  contentToString: (content: T) => string,
) {
  return createPromptPartMessageFn<T[]>({
    heading: "EXEMPLAR CONTENT",
    description: () =>
      "This is exemplar content from similar Oak Academy lessons, it should be used as a guide for the section you are creating.",
    contentToString: (content) =>
      content
        .map(
          (item, i) =>
            `<example-${i + 1}>${contentToString(item)}</example-${i + 1}>`,
        )
        .join("\n"),
  })(content);
}
