import { createPromptPartMessageFn } from "./_createPromptPart";

export function currentSectionValuePromptPart<T>(
  content: T,
  contentToString: (content: T) => string,
) {
  return createPromptPartMessageFn<T>({
    heading: "CURRENT SECTION VALUE",
    description: () =>
      "This is the current value of the section you are generating. Use it as a starting point.",
    contentToString,
  })(content);
}
