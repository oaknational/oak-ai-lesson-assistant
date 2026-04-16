import { generateCellId } from "../generateCellId";

describe("generateCellId", () => {
  it("generates correct format for basic table ID", () => {
    const result = generateCellId("table1", 0, 0);
    expect(result).toBe("table1_r0c0");
  });

  it("generates correct format with row and column indices", () => {
    const result = generateCellId("p42_i1629", 1, 2);
    expect(result).toBe("p42_i1629_r1c2");
  });

  it("handles table IDs with underscores", () => {
    const result = generateCellId("g123_abc_def", 3, 4);
    expect(result).toBe("g123_abc_def_r3c4");
  });

  it("handles zero indices", () => {
    const result = generateCellId("myTable", 0, 0);
    expect(result).toBe("myTable_r0c0");
  });

  it("handles large indices", () => {
    const result = generateCellId("table", 99, 50);
    expect(result).toBe("table_r99c50");
  });
});
