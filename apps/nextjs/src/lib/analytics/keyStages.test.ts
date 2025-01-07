import { parseKeyStage } from "./keyStages";

const testKeyStageMap: Record<
  string,
  "ks1" | "ks2" | "ks3" | "ks4" | "ks5" | "early-years-foundation-stage"
> = {
  "1-2": "ks1",
  "10": "ks4",
  "12": "ks5",
  "6": "ks2",
  "A Level": "ks5",
  "A level": "ks5",
  "A-Level": "ks5",
  "A-level": "ks5",
  ALevel: "ks5",
  EYFS: "early-years-foundation-stage",
  "EYFS SEN": "early-years-foundation-stage",
  "Early Years": "early-years-foundation-stage",
  "Early Years Foundation Stage": "early-years-foundation-stage",
  "Early Years Foundation Stage (EYFS)": "early-years-foundation-stage",
  "Foundation Stage": "early-years-foundation-stage",
  GCSE: "ks4",
  "GCSE Higher": "ks4",
  "GCSE OCR": "ks4",
  KS1: "ks1",
  KS2: "ks2",
  "KS2 Upper": "ks2",
  "KS2 Year 4": "ks2",
  "KS2 Year 5": "ks2",
  KS3: "ks3",
  "KS3 Geography": "ks3",
  "KS3 Geography L1 . Mrs Karaphillides": "ks3",
  "KS3 and KS4": "ks3",
  "KS3,4": "ks3",
  "KS3-4": "ks3",
  KS4: "ks4",
  "KS4 and KS5": "ks4",
  KS5: "ks5",
  "Key Stage 1": "ks1",
  "Key Stage 1 & 2": "ks1",
  "Key Stage 1 and Key Stage 2": "ks1",
  "Key Stage 1/2": "ks1",
  "Key Stage 2": "ks2",
  "Key Stage 2 Year 4": "ks2",
  "Key Stage 2, Year 3": "ks2",
  "Key Stage 2/3": "ks2",
  "Key Stage 3": "ks3",
  "Key Stage 3 & 4": "ks3",
  "Key Stage 3, 4": "ks3",
  "Key Stage 3, Year 9": "ks3",
  "Key Stage 4": "ks4",
  "Key Stage 4 (Year 11, GCSE)": "ks4",
  "Key Stage 5": "ks5",
  "Key Stage 5 (AS Level)": "ks5",
  "Key Stage 5+": "ks5",
  Reception: "early-years-foundation-stage",
  "Year 1": "ks1",
  "Year 1/2": "ks1",
  "Year 10": "ks4",
  "Year 11": "ks4",
  "Year 12": "ks5",
  "Year 2": "ks1",
  "Year 3": "ks2",
  "Year 3 & 4": "ks2",
  "Year 4": "ks2",
  "Year 5": "ks2",
  "Year 5 - Key Stage 2": "ks2",
  "Year 6": "ks2",
  "Year 7": "ks3",
  "Year 8": "ks3",
  "Year 9": "ks3",
  "early-years": "early-years-foundation-stage",
  "early-years-foundation-stage": "early-years-foundation-stage",
  "early-years-foundation-stage, key-stage-1, key-stage-2":
    "early-years-foundation-stage",
  eyfs: "early-years-foundation-stage",
  "key stage 3": "ks3",
  "key stage 4": "ks4",
  "key-stage-1": "ks1",
  "key-stage-1 and key-stage-2": "ks1",
  "key-stage-1, key-stage-2": "ks1",
  "key-stage-2": "ks2",
  "key-stage-2 Year 4": "ks2",
  "key-stage-2 year 6": "ks2",
  "key-stage-2, key-stage-3": "ks2",
  "key-stage-3": "ks3",
  "key-stage-3, key-stage-4": "ks3",
  "key-stage-3|key-stage-4": "ks3",
  "key-stage-4": "ks4",
  "key-stage-5": "ks5",
  "sixth form": "ks5",
  "year 1": "ks1",
  "year 4": "ks2",
  "year-3": "ks2",
  "year-4": "ks2",
  "year-5": "ks2",
  "year-7": "ks3",
  "year-8": "ks3",
  "year-9": "ks3",
};

describe("Analytics helpers", () => {
  describe("parseKeyStage", () => {
    test("Converts 'Key stage {n}' to 'ks{n}'", () => {
      expect(parseKeyStage("Key stage 3")).toBe("ks3");
    });
    test("Converts 'key-stage-{n}' to 'ks{n}'", () => {
      expect(parseKeyStage("key-stage-2")).toBe("ks2");
    });
    test("Converts 'KS{n}' to 'ks{n}'", () => {
      expect(parseKeyStage("KS1")).toBe("ks1");
    });
    test("Converts '{n} to 'ks{n}'", () => {
      expect(parseKeyStage("1")).toBe("ks1");
    });
    test.each(Object.entries(testKeyStageMap))(
      "Converts '%s' to '%s'",
      (input, expected) => {
        expect(parseKeyStage(input)).toBe(expected);
      },
    );
  });
});
