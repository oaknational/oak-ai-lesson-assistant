export function createPromptPartMessageFn<T>({
  heading,
  description,
  contentToString = JSON.stringify,
}: {
  heading: string;
  description: (content: T) => string;
  contentToString?: (content: T) => string;
}) {
  return (
    content: T,
    _contentToString: (content: T) => string = contentToString ??
      JSON.stringify,
  ) => [heading, description(content), _contentToString(content)].join("\n\n");
}
