import type { GoogleSlidesTable } from "@oakai/gsuite";

import { extractTableCells } from "../extractTableCells";

describe("extractTableCells", () => {
  it("returns empty array when table has no rows", () => {
    const table: GoogleSlidesTable = {
      rows: 0,
      columns: 0,
    };

    const result = extractTableCells("table1", table);
    expect(result).toEqual([]);
  });

  it("extracts cells with IDs from a simple 2x2 table", () => {
    const table: GoogleSlidesTable = {
      rows: 2,
      columns: 2,
      tableRows: [
        {
          tableCells: [
            {
              text: {
                textElements: [{ textRun: { content: "A1" } }],
              },
            },
            {
              text: {
                textElements: [{ textRun: { content: "B1" } }],
              },
            },
          ],
        },
        {
          tableCells: [
            {
              text: {
                textElements: [{ textRun: { content: "A2" } }],
              },
            },
            {
              text: {
                textElements: [{ textRun: { content: "B2" } }],
              },
            },
          ],
        },
      ],
    };

    const result = extractTableCells("myTable", table);
    expect(result).toEqual([
      [
        { id: "myTable_r0c0", content: "A1", row: 0, col: 0 },
        { id: "myTable_r0c1", content: "B1", row: 0, col: 1 },
      ],
      [
        { id: "myTable_r1c0", content: "A2", row: 1, col: 0 },
        { id: "myTable_r1c1", content: "B2", row: 1, col: 1 },
      ],
    ]);
  });

  it("handles cells with no text content", () => {
    const table: GoogleSlidesTable = {
      rows: 1,
      columns: 2,
      tableRows: [
        {
          tableCells: [
            {
              text: {
                textElements: [{ textRun: { content: "Has content" } }],
              },
            },
            {
              text: {
                textElements: [],
              },
            },
          ],
        },
      ],
    };

    const result = extractTableCells("t1", table);
    expect(result).toEqual([
      [
        { id: "t1_r0c0", content: "Has content", row: 0, col: 0 },
        { id: "t1_r0c1", content: "", row: 0, col: 1 },
      ],
    ]);
  });

  it("handles cells with undefined text", () => {
    const table: GoogleSlidesTable = {
      rows: 1,
      columns: 2,
      tableRows: [
        {
          tableCells: [
            {
              text: {
                textElements: [{ textRun: { content: "Cell 1" } }],
              },
            },
            {
              // No text property
            },
          ],
        },
      ],
    };

    const result = extractTableCells("t1", table);
    expect(result).toEqual([
      [
        { id: "t1_r0c0", content: "Cell 1", row: 0, col: 0 },
        { id: "t1_r0c1", content: "", row: 0, col: 1 },
      ],
    ]);
  });

  it("handles multi-line cell content", () => {
    const table: GoogleSlidesTable = {
      rows: 1,
      columns: 1,
      tableRows: [
        {
          tableCells: [
            {
              text: {
                textElements: [
                  { textRun: { content: "Line 1\n" } },
                  { textRun: { content: "Line 2" } },
                ],
              },
            },
          ],
        },
      ],
    };

    const result = extractTableCells("t1", table);
    expect(result).toEqual([
      [{ id: "t1_r0c0", content: "Line 1\nLine 2", row: 0, col: 0 }],
    ]);
  });

  it("generates correct composite IDs for table with underscores in ID", () => {
    const table: GoogleSlidesTable = {
      rows: 1,
      columns: 1,
      tableRows: [
        {
          tableCells: [
            {
              text: {
                textElements: [{ textRun: { content: "Test" } }],
              },
            },
          ],
        },
      ],
    };

    const result = extractTableCells("p42_i1629", table);
    expect(result[0]?.[0]?.id).toBe("p42_i1629_r0c0");
  });
});
