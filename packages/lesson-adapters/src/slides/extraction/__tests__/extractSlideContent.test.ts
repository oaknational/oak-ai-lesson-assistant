import type { GoogleSlidesPage } from "@oakai/gsuite";

import { extractSlideContent } from "../extractSlideContent";

describe("extractSlideContent", () => {
  it("extracts basic slide information", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.slideNumber).toBe(1);
    expect(result.slideId).toBe("slide1");
    expect(result.textElements).toEqual([]);
    expect(result.tables).toEqual([]);
    expect(result.nonTextElements).toEqual([]);
  });

  it("extracts text from shape elements", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [
        {
          objectId: "textbox1",
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: [{ textRun: { content: "Hello World" } }],
            },
            placeholder: {
              type: "BODY",
            },
          },
        },
      ],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.textElements).toHaveLength(1);
    expect(result.textElements[0]).toEqual({
      id: "textbox1",
      content: "Hello World",
      placeholderType: "BODY",
      placeholderIndex: undefined,
    });
  });

  it("extracts title from TITLE placeholder", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [
        {
          objectId: "title1",
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: [{ textRun: { content: "Slide Title" } }],
            },
            placeholder: {
              type: "TITLE",
            },
          },
        },
      ],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.slideTitle).toBe("Slide Title");
  });

  it("classifies non-text elements", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [
        {
          objectId: "image1",
          image: {
            contentUrl: "https://example.com/image.png",
          },
        },
      ],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.nonTextElements).toHaveLength(1);
    expect(result.nonTextElements[0]).toEqual({
      id: "image1",
      type: "image",
      description: "image",
    });
  });

  it("extracts table data with cell IDs", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [
        {
          objectId: "table1",
          table: {
            rows: 2,
            columns: 2,
            tableRows: [
              {
                tableCells: [
                  { text: { textElements: [{ textRun: { content: "A" } }] } },
                  { text: { textElements: [{ textRun: { content: "B" } }] } },
                ],
              },
              {
                tableCells: [
                  { text: { textElements: [{ textRun: { content: "C" } }] } },
                  { text: { textElements: [{ textRun: { content: "D" } }] } },
                ],
              },
            ],
          },
        },
      ],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.tables).toHaveLength(1);
    expect(result.tables[0]).toEqual({
      id: "table1",
      rows: 2,
      columns: 2,
      cells: [
        [
          { id: "table1_r0c0", content: "A", row: 0, col: 0 },
          { id: "table1_r0c1", content: "B", row: 0, col: 1 },
        ],
        [
          { id: "table1_r1c0", content: "C", row: 1, col: 0 },
          { id: "table1_r1c1", content: "D", row: 1, col: 1 },
        ],
      ],
    });
  });

  it("uses layout name when available", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      slideProperties: {
        layoutObjectId: "layout1",
      },
      pageElements: [],
    };

    const layouts: GoogleSlidesPage[] = [
      {
        objectId: "layout1",
        layoutProperties: {
          displayName: "Title Slide",
        },
        pageElements: [],
      },
    ];

    const result = extractSlideContent(slide, 1, layouts);

    expect(result.layoutName).toBe("Title Slide");
  });

  it("skips elements without objectId", () => {
    const slide: GoogleSlidesPage = {
      objectId: "slide1",
      pageElements: [
        {
          // No objectId
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: [{ textRun: { content: "Should be skipped" } }],
            },
          },
        },
        {
          objectId: "valid1",
          shape: {
            shapeType: "TEXT_BOX",
            text: {
              textElements: [{ textRun: { content: "Valid text" } }],
            },
          },
        },
      ],
    };

    const result = extractSlideContent(slide, 1, undefined);

    expect(result.textElements).toHaveLength(1);
    expect(result.textElements[0]?.content).toBe("Valid text");
  });
});
