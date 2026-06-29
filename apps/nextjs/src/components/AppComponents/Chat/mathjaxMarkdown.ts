const fencedCodeBlockPattern = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const mathJaxDelimiterChars = new Set(["(", ")", "[", "]"]);

export const preserveMathJaxDelimiters = (markdown: string) => {
  const lines = markdown.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g) ?? [];
  const chunks = lines.at(-1) === "" ? lines.slice(0, -1) : lines;
  let fence: { marker: "`" | "~"; length: number } | null = null;

  return chunks
    .map((line) => {
      const fenceMatch = getFenceMatch(line);

      if (fence) {
        if (isClosingFence(fenceMatch, fence)) {
          fence = null;
        }
        return line;
      }

      if (fenceMatch) {
        const delimiter = fenceMatch[2] ?? "";
        fence = {
          marker: delimiter[0] as "`" | "~",
          length: delimiter.length,
        };
        return line;
      }

      return preserveInlineMathJaxDelimiters(line);
    })
    .join("");
};

const getFenceMatch = (line: string) =>
  line.replace(/\r\n$|\n$|\r$/, "").match(fencedCodeBlockPattern);

const isClosingFence = (
  match: RegExpMatchArray | null,
  fence: { marker: "`" | "~"; length: number },
) => {
  const delimiter = match?.[2] ?? "";
  const suffix = match?.[3] ?? "";
  return (
    delimiter.startsWith(fence.marker) &&
    delimiter.length >= fence.length &&
    suffix.trim() === ""
  );
};

const preserveInlineMathJaxDelimiters = (markdown: string) => {
  let result = "";
  let index = 0;

  while (index < markdown.length) {
    const openingBackticks = /`+/.exec(markdown.slice(index));

    if (!openingBackticks) {
      result += escapeMathJaxDelimiters(markdown.slice(index));
      break;
    }

    const codeStart = index + openingBackticks.index;
    const delimiter = openingBackticks[0];
    // Find a closing delimiter that is a maximal backtick run (not adjacent to
    // more backticks), matching the CommonMark spec for inline code spans.
    let searchFrom = codeStart + delimiter.length;
    let codeEnd = -1;
    while (true) {
      const candidate = markdown.indexOf(delimiter, searchFrom);
      if (candidate === -1) break;
      const prevChar = markdown[candidate - 1];
      const nextChar = markdown[candidate + delimiter.length];
      if (prevChar !== "`" && nextChar !== "`") {
        codeEnd = candidate;
        break;
      }
      searchFrom = candidate + 1;
    }

    if (codeEnd === -1) {
      result += escapeMathJaxDelimiters(markdown.slice(index));
      break;
    }

    result += escapeMathJaxDelimiters(markdown.slice(index, codeStart));
    result += markdown.slice(codeStart, codeEnd + delimiter.length);
    index = codeEnd + delimiter.length;
  }

  return result;
};

const escapeMathJaxDelimiters = (markdown: string) => {
  let result = "";

  for (let index = 0; index < markdown.length; index++) {
    const character = markdown[index];
    const nextCharacter = markdown[index + 1];

    if (
      character === "\\" &&
      markdown[index - 1] !== "\\" &&
      nextCharacter &&
      mathJaxDelimiterChars.has(nextCharacter)
    ) {
      result += `\\\\${nextCharacter}`;
      index++;
      continue;
    }

    result += character;
  }

  return result;
};
