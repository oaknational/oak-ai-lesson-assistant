import { blocksSchema } from "../schema/additionalResourceBlockSchema.schema";

export const extractDataFromBlocks = <T>(
  blocks: T,
): Record<string, string | string[] | null | undefined> => {
  const map: Record<string, string | string[] | null | undefined> = {};
  const passedBlocks = blocksSchema.parse(blocks);

  for (const block of passedBlocks) {
    switch (block.type) {
      case "title":
        map[block.type] = block.text;
        break;
      case "labelValue":
        if (
          block.items.length > 0 &&
          block.items[0]?.label &&
          typeof block.items[0].label === "string" &&
          !block.items[0].label.includes("_")
        ) {
          for (const [i, item] of block.items.entries()) {
            map[`label_${i + 1}`] = item.label;
            map[`value_${i + 1}`] = item.value;
          }
        } else {
          for (const item of block.items) {
            map[item.label] = item.value;
          }
        }
        break;
      case "quiz":
        if (block.questions) {
          for (const [i, question] of block.questions.entries()) {
            map[`question_${i + 1}`] = question.question;
            map[`answers_${i + 1}`] = JSON.stringify(question.answers);
          }
        }
        break;
      case "placeholders":
        // For direct placeholder mapping, simply merge the map
        Object.assign(map, block.map);
        break;
    }

    if (!map) {
      throw new Error("No data found");
    }
  }
  return map;
};
