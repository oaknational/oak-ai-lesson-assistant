import { blocksSchema } from "schema/resourceDoc.schema";

export const extractDataFromBlocks = <T>(
  blocks: T,
): Record<string, string | string[] | null | undefined> => {
  const map: Record<string, string | string[] | null | undefined> = {};
  const passedBlocks = blocksSchema.parse(blocks);

  for (const block of passedBlocks) {
    switch (block.type) {
      case "title":
        map[block.type] = block.text ?? null;
        break;
      case "labelValue":
        for (const [i, item] of block.items.entries()) {
          map[`label_${i + 1}`] = item.label;
          map[`value_${i + 1}`] = item.value;
        }
        break;
    }

    if (!map) {
      throw new Error("No data found");
    }
  }
  return map;
};
