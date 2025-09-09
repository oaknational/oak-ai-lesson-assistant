import { createPromptPartMessageFn } from "./_createPromptPart";

export function basedOnContentPromptPart<T>(
  content: T,
  contentToString: (content: T) => string,
) {
  return createPromptPartMessageFn<T>({
    heading: "BASED ON CONTENT",
    description: () =>
      "The user is adapting an Oak lesson which has the following content for this section. Match the text below verbatim, only diverging if necessary to make sense or if the user has specified otherwise. If there's no way to do this without contradiction then return an error, with justification.",
    contentToString: (content) =>
      `<BasedOn-Content>\n${contentToString(content)}\n</BasedOn-Content>`,
  })(content);
}
