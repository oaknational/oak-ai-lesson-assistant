import { createPromptPartMessageFn } from "./_createPromptPart";

export function exemplarContentPromptPart<T>(
  content: T[],
  contentToString: (content: T) => string,
) {
  return createPromptPartMessageFn<T[]>({
    heading: "EXEMPLAR CONTENT",
    description: () =>
      "The following is exemplar content from similar Oak Academy lessons, it should be used as a guide for 'what good looks like' for the section you are generating. Don't copy it verbatim, but use it to inspire your own unique output. If there is a 'based on content' section below, use that as your primary source, and this exemplar content only as a secondary guide.",
    contentToString: (content) =>
      content
        .map(
          (item, i) =>
            `\n<Example-${i + 1}>\n${contentToString(item)}\n</Example-${i + 1}>`,
        )
        .join("\n\n"),
  })(content);
}
