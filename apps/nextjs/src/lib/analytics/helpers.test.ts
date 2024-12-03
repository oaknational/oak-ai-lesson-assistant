import { parseKeyStage } from "./helpers";

describe("Analytics helpers", () => {
  describe("parseKeyStage", () => {
    test("Converts 'Key stage {n}' to 'ks{n}'", () => {
      expect(parseKeyStage("Key stage 3")).toBe("ks3");
    });
    test("Converts 'key-stage-{n}' to 'ks{n}'", () => {
      expect(parseKeyStage("key-stage-2")).toBe("ks2");
    });
    test("Converts 'KS{n}' to 'ks{n}'", () => {
      expect(parseKeyStage("KS1")).toBe("ks1    ");
    });
    test("Converts '{n} to 'ks{n}'", () => {
      expect(parseKeyStage("1")).toBe("ks1");
    });
    test("lowercases any text", () => {
      expect(parseKeyStage("ssWROijfdSKFNLe")).toBe("sswroijfdskfnle");
    });
  });
});
