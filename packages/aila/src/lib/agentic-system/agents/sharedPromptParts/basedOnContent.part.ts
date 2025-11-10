import { createPromptPartMessageFn } from "./_createPromptPart";

export function basedOnContentPromptPart<T>(
  content: T,
  contentToString: (content: T) => string,
) {
  return createPromptPartMessageFn<T>({
    heading: "BASED ON CONTENT",
    description: () =>
      "Only diverge from this content if necessary to make sense or if the user has specified otherwise. If there's no way to do this without contradiction then return an error, with justification.",
    contentToString,
  })(content);
}
