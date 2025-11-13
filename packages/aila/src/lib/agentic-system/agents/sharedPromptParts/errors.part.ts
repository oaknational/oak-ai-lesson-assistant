import { createPromptPartMessageFn } from "./_createPromptPart";

export const errorsPromptPart = createPromptPartMessageFn<
  { message: string }[]
>({
  heading: "ERRORS",
  description: () => "The following errors occurred during processing:",
  contentToString: (errors) =>
    errors.map((error) => `- ${error.message}`).join("\n"),
});
