import { generateCellId } from "../generateCellId";
import { parseCellId } from "../parseCellId";

describe("parseCellId", () => {
  it("parses a valid cell ID", () => {
    const result = parseCellId("table1_r0c0");
    expect(result).toEqual({
      tableId: "table1",
      row: 0,
      col: 0,
    });
  });

  it("parses cell ID with larger indices", () => {
    const result = parseCellId("p42_i1629_r1c2");
    expect(result).toEqual({
      tableId: "p42_i1629",
      row: 1,
      col: 2,
    });
  });

  it("handles table IDs with multiple underscores", () => {
    const result = parseCellId("g123_abc_def_r3c4");
    expect(result).toEqual({
      tableId: "g123_abc_def",
      row: 3,
      col: 4,
    });
  });

  it("returns null for invalid format - no row/col suffix", () => {
    const result = parseCellId("invalid");
    expect(result).toBeNull();
  });

  it("returns null for invalid format - missing col", () => {
    const result = parseCellId("table_r1");
    expect(result).toBeNull();
  });

  it("returns null for invalid format - missing row", () => {
    const result = parseCellId("table_c1");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    const result = parseCellId("");
    expect(result).toBeNull();
  });

  it("returns null for malformed indices", () => {
    const result = parseCellId("table_rAcB");
    expect(result).toBeNull();
  });

  it("roundtrips with generateCellId", () => {
    const tableId = "my_table_123";
    const row = 5;
    const col = 10;

    const cellId = generateCellId(tableId, row, col);
    const parsed = parseCellId(cellId);

    expect(parsed).toEqual({ tableId, row, col });
  });
});
