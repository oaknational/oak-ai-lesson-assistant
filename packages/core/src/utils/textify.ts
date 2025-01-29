import yaml from "yaml";

// Simplifies the input to a string for embedding
export function textify(input: unknown): string {
  if (Array.isArray(input)) {
    return input.map((row) => textify(row)).join("\n");
  } else if (typeof input === "object" && input !== null) {
    return yaml.stringify(input);
  } else {
    return String(input);
  }
}
