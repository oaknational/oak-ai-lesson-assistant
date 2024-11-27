export function getFileName({
  id,
  lessonTitle,
  exportType,
}: {
  id: string;
  lessonTitle: string;
  exportType:
    | "lesson-plan"
    | "worksheet"
    | "lesson-slides"
    | "starter-quiz"
    | "exit-quiz";
}) {
  return `${lessonTitle}-${id}-${exportType}`;
}

/**
 * @description
 * - If the value is falsey, an empty string is returned.
 * - If the value is a string, it is returned as is.
 * - If the value is an array:
 *   - it defaults to joining with a newline character
 *   - it's possible to customise the join character based on the key
 */
export function defaultValueToString<Data extends Record<string, unknown>>(
  _: keyof Data,
  value: string | string[] | null | undefined,
): string {
  if (!value) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join("\n");
  } else {
    return value;
  }
}
export type ValueToString<Data extends Record<string, unknown>> =
  typeof defaultValueToString<Data>;

export function camelCaseToTitleCase(str: string | null | undefined) {
  if (str === null || str === undefined) {
    return str;
  }
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .replace(/^./, function (str) {
      return str.toUpperCase();
    });
}

/**
 * @description Mixes answers and distractors, with options to:
 * - sort alphabetically
 * - include ticks
 * - prefix with ABC
 */
export function processQuizAnswers(
  {
    sortAlpha = true,
    includeTicks = true,
    prefixWithABC = true,
  }: {
    sortAlpha: boolean;
    includeTicks: boolean;
    prefixWithABC: boolean;
  },
  answers: string[] | undefined = [],
  distractors: string[] | undefined = [],
) {
  if (includeTicks) {
    answers = answers.map((answer) => `${answer}  ✓`);
  }

  if (sortAlpha) {
    answers = [...answers, ...distractors].sort((a, b) => a.localeCompare(b));
  }

  if (prefixWithABC) {
    answers = answers.map((s, i) => `${String.fromCharCode(65 + i)}.   ${s}`);
  }

  return answers;
}

export function stringOrBullets(input: undefined | string | string[]) {
  if (!input) {
    return "";
  }
  if (typeof input === "string") {
    return input;
  }
  return input.map((x) => `* ${x}`).join("\n");
}
