import type { SectionKey } from "../schema";
import { LIST_SECTION_CONFIG } from "./executePlanSteps";

// A schema-valid item for each list section, used to build arrays of a chosen
// length when probing the configured bounds against the section schema.
const SAMPLE_ITEM: Partial<Record<SectionKey, object>> = {
  keywords: { keyword: "Photosynthesis", definition: "How plants make food." },
  misconceptions: {
    misconception: "Plants get their food from the soil.",
    description: "Plants make food by photosynthesis, not from the soil.",
  },
};

type ListSectionConfigValue = NonNullable<
  (typeof LIST_SECTION_CONFIG)[SectionKey]
>;

const configEntries = Object.entries(LIST_SECTION_CONFIG) as Array<
  [SectionKey, ListSectionConfigValue]
>;

describe("LIST_SECTION_CONFIG bounds stay in step with the section schemas", () => {
  it.each(configEntries)(
    "%s min and max match what its schema enforces",
    (sectionKey, config) => {
      const item = SAMPLE_ITEM[sectionKey];
      if (!item) {
        throw new Error(`Add a sample item for the ${sectionKey} section`);
      }
      const arrayOfLength = (length: number) =>
        Array.from({ length }, () => ({ ...item }));

      // max items are accepted, one more is rejected
      expect(
        config.arraySchema.safeParse(arrayOfLength(config.max)).success,
      ).toBe(true);
      expect(
        config.arraySchema.safeParse(arrayOfLength(config.max + 1)).success,
      ).toBe(false);

      // min items are accepted; if there is a real lower bound, one fewer is rejected
      expect(
        config.arraySchema.safeParse(arrayOfLength(config.min)).success,
      ).toBe(true);
      if (config.min >= 1) {
        expect(
          config.arraySchema.safeParse(arrayOfLength(config.min - 1)).success,
        ).toBe(false);
      }
    },
  );
});
