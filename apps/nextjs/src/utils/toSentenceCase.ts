export function toSentenceCase(input: string): string {
  const sentences = input.split(". ");

  const result = sentences
    .map((sentence) => {
      if (sentence.length > 0) {
        const firstChar = sentence.charAt(0).toUpperCase();
        const restOfString = sentence.slice(1).toLowerCase();
        return firstChar + restOfString;
      } else {
        return sentence; // Handle empty sentences, e.g., consecutive dots ".."
      }
    })
    .join(". ");

  return result;
}
