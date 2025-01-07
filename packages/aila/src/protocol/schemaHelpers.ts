export function minMaxText({
  min,
  max,
  entity = "elements",
}: {
  min?: number;
  max?: number;
  entity?: "elements" | "characters";
}) {
  if (typeof min !== "number" && typeof max !== "number") {
    throw new Error("min or max must be provided");
  }
  if (typeof min === "number" && typeof max === "number") {
    return `Minimum ${min}, maximum ${max} ${entity}`;
  }
  if (typeof min === "number") {
    return `Minimum ${min} ${entity}`;
  }
  return `Maximum ${max} ${entity}`;
}
