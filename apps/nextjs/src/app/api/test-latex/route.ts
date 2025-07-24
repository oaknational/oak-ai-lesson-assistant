import { findLatexPatterns, renderLatexToPng } from "@oakai/exports";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Please provide text with LaTeX equations" },
        { status: 400 },
      );
    }

    // Find LaTeX patterns
    const patterns = findLatexPatterns(text);

    if (patterns.length === 0) {
      return NextResponse.json({
        message: "No LaTeX patterns found",
        patterns: [],
      });
    }

    // Render the first pattern as a test
    const firstPattern = patterns[0];
    if (!firstPattern) {
      return NextResponse.json({
        message: "No patterns to render",
        patterns: [],
      });
    }

    const pngBuffer = await renderLatexToPng(
      firstPattern.latex,
      firstPattern.type,
    );

    // Convert to base64 for response
    const base64 = pngBuffer.toString("base64");
    const dataUri = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      patterns: patterns.map((p) => ({
        latex: p.latex,
        type: p.type,
        startIndex: p.startIndex,
        endIndex: p.endIndex,
      })),
      firstPatternRendered: {
        latex: firstPattern.latex,
        type: firstPattern.type,
        dataUri,
        size: pngBuffer.length,
      },
    });
  } catch (error) {
    console.error("LaTeX rendering error:", error);
    return NextResponse.json(
      {
        error: "Failed to render LaTeX",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "LaTeX rendering test endpoint",
    usage:
      "POST /api/test-latex with JSON body: { text: 'Your text with $LaTeX$ equations' }",
    example: {
      text: "The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$",
    },
  });
}
