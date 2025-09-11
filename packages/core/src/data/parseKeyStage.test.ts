import { parseKeyStage } from "./parseKeyStage";

const testKeyStageMap: Record<
  string,
  | "key-stage-1"
  | "key-stage-2"
  | "key-stage-3"
  | "key-stage-4"
  | "key-stage-5"
  | "early-years-foundation-stage"
> = {
  "1-2": "key-stage-1",
  "10": "key-stage-4",
  "12": "key-stage-5",
  "6": "key-stage-2",
  "A Level": "key-stage-5",
  "A level": "key-stage-5",
  "A-Level": "key-stage-5",
  "A-level": "key-stage-5",
  ALevel: "key-stage-5",
  EYFS: "early-years-foundation-stage",
  "EYFS SEN": "early-years-foundation-stage",
  "Early Years": "early-years-foundation-stage",
  "Early Years Foundation Stage": "early-years-foundation-stage",
  "Early Years Foundation Stage (EYFS)": "early-years-foundation-stage",
  "Foundation Stage": "early-years-foundation-stage",
  GCSE: "key-stage-4",
  "GCSE Higher": "key-stage-4",
  "GCSE OCR": "key-stage-4",
  KS1: "key-stage-1",
  KS2: "key-stage-2",
  "KS2 Upper": "key-stage-2",
  "KS2 Year 4": "key-stage-2",
  "KS2 Year 5": "key-stage-2",
  KS3: "key-stage-3",
  "KS3 Geography": "key-stage-3",
  "KS3 Geography L1 . Mrs Karaphillides": "key-stage-3",
  "KS3 and KS4": "key-stage-3",
  "KS3,4": "key-stage-3",
  "KS3-4": "key-stage-3",
  KS4: "key-stage-4",
  "KS4 and KS5": "key-stage-4",
  KS5: "key-stage-5",
  "Key Stage 1": "key-stage-1",
  "Key Stage 1 & 2": "key-stage-1",
  "Key Stage 1 and Key Stage 2": "key-stage-1",
  "Key Stage 1/2": "key-stage-1",
  "Key Stage 2": "key-stage-2",
  "Key Stage 2 Year 4": "key-stage-2",
  "Key Stage 2, Year 3": "key-stage-2",
  "Key Stage 2/3": "key-stage-2",
  "Key Stage 3": "key-stage-3",
  "Key Stage 3 & 4": "key-stage-3",
  "Key Stage 3, 4": "key-stage-3",
  "Key Stage 3, Year 9": "key-stage-3",
  "Key Stage 4": "key-stage-4",
  "Key Stage 4 (Year 11, GCSE)": "key-stage-4",
  "Key Stage 5": "key-stage-5",
  "Key Stage 5 (AS Level)": "key-stage-5",
  "Key Stage 5+": "key-stage-5",
  Reception: "early-years-foundation-stage",
  "Year 1": "key-stage-1",
  "Year 1/2": "key-stage-1",
  "Year 10": "key-stage-4",
  "Year 11": "key-stage-4",
  "Year 12": "key-stage-5",
  "Year 2": "key-stage-1",
  "Year 3": "key-stage-2",
  "Year 3 & 4": "key-stage-2",
  "Year 4": "key-stage-2",
  "Year 5": "key-stage-2",
  "Year 5 - Key Stage 2": "key-stage-2",
  "Year 6": "key-stage-2",
  "Year 7": "key-stage-3",
  "Year 8": "key-stage-3",
  "Year 9": "key-stage-3",
  "early-years": "early-years-foundation-stage",
  "early-years-foundation-stage": "early-years-foundation-stage",
  "early-years-foundation-stage, key-stage-1, key-stage-2":
    "early-years-foundation-stage",
  eyfs: "early-years-foundation-stage",
  "key stage 3": "key-stage-3",
  "key stage 4": "key-stage-4",
  "key-stage-1": "key-stage-1",
  "key-stage-1 and key-stage-2": "key-stage-1",
  "key-stage-1, key-stage-2": "key-stage-1",
  "key-stage-2": "key-stage-2",
  "key-stage-2 Year 4": "key-stage-2",
  "key-stage-2 year 6": "key-stage-2",
  "key-stage-2, key-stage-3": "key-stage-2",
  "key-stage-3": "key-stage-3",
  "key-stage-3, key-stage-4": "key-stage-3",
  "key-stage-3|key-stage-4": "key-stage-3",
  "key-stage-4": "key-stage-4",
  "key-stage-5": "key-stage-5",
  "sixth form": "key-stage-5",
  "year 1": "key-stage-1",
  "year 4": "key-stage-2",
  "year-3": "key-stage-2",
  "year-4": "key-stage-2",
  "year-5": "key-stage-2",
  "year-7": "key-stage-3",
  "year-8": "key-stage-3",
  "year-9": "key-stage-3",
};

describe("Analytics helpers", () => {
  describe("parseKeyStage", () => {
    test("Converts 'Key stage {n}' to 'key-stage-{n}'", () => {
      expect(parseKeyStage("Key stage 3")).toBe("key-stage-3");
    });
    test("Converts 'key-stage-{n}' to 'key-stage-{n}'", () => {
      expect(parseKeyStage("key-stage-2")).toBe("key-stage-2");
    });
    test("Converts 'KS{n}' to 'key-stage-{n}'", () => {
      expect(parseKeyStage("KS1")).toBe("key-stage-1");
    });
    test("Converts '{n} to 'key-stage-{n}'", () => {
      expect(parseKeyStage("1")).toBe("key-stage-1");
    });
    test.each(Object.entries(testKeyStageMap))(
      "Converts '%s' to '%s'",
      (input, expected) => {
        expect(parseKeyStage(input)).toBe(expected);
      },
    );
  });
});
