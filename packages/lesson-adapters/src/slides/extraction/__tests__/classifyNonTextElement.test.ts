import type { GoogleSlidesPageElement } from "@oakai/google";

import { classifyNonTextElement } from "../classifyNonTextElement";

describe("classifyNonTextElement", () => {
  it("classifies a shape element", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "shape1",
      shape: {
        shapeType: "RECTANGLE",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("shape");
    expect(result.description).toBe("RECTANGLE");
  });

  it("uses alt text for shape when available", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "shape1",
      title: "My Custom Shape",
      shape: {
        shapeType: "ELLIPSE",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("shape");
    expect(result.description).toBe("My Custom Shape");
  });

  it("classifies an image element", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "image1",
      image: {
        contentUrl: "https://example.com/image.png",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("image");
    expect(result.description).toBe("image");
  });

  it("uses alt text for image when available", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "image1",
      title: "Company Logo",
      image: {
        contentUrl: "https://example.com/logo.png",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("image");
    expect(result.description).toBe("Company Logo");
  });

  it("classifies a video element", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "video1",
      video: {
        url: "https://youtube.com/watch?v=123",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("video");
    expect(result.description).toBe("video");
  });

  it("classifies a table element with dimensions", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "table1",
      table: {
        rows: 3,
        columns: 4,
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("table");
    expect(result.description).toBe("3x4");
  });

  it("classifies a line element", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "line1",
      line: {
        lineType: "STRAIGHT_LINE",
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("line");
    expect(result.description).toBe("STRAIGHT_LINE");
  });

  it("classifies an element group as diagram", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "group1",
      elementGroup: {
        children: [],
      },
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("diagram");
    expect(result.description).toBe("element_group");
  });

  it("classifies unknown element type", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "unknown1",
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("unknown");
    expect(result.description).toBe("unknown");
  });

  it("uses alt text for unknown element when available", () => {
    const element: GoogleSlidesPageElement = {
      objectId: "unknown1",
      title: "Mystery Element",
    };

    const result = classifyNonTextElement(element);
    expect(result.type).toBe("unknown");
    expect(result.description).toBe("Mystery Element");
  });
});
