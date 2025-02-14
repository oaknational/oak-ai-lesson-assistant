import { camelCaseToSentenceCase } from "@oakai/core/src/utils/camelCaseConversion";

export function sectionTitle(str: string) {
  if (str.startsWith("cycle")) {
    return "Learning cycle " + str.split("cycle")[1];
  }

  return camelCaseToSentenceCase(str);
}
