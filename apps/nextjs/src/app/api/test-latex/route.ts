// Import directly from the source to avoid client-side bundling issues
import { latexToSvg } from "@oakai/exports/src/images/latexToSvg";
import { svgToPng } from "@oakai/exports/src/images/svgToPng";

import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { test, latex } = body;

    if (test === "svg-to-png") {
      // Test basic SVG to PNG conversion using a simple LaTeX equation
      const svg = latexToSvg("E = mc^2");

      const pngBuffer = svgToPng(svg, {
        width: 600,
        background: "white",
      });

      // Convert to base64 for display
      const base64 = pngBuffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({
        success: true,
        message: `Successfully converted SVG to PNG (${pngBuffer.length} bytes)`,
        imageUrl: dataUrl,
      });
    }

    if (test === "latex-to-svg-to-png") {
      // Test full LaTeX → SVG → PNG pipeline
      const latexInput = latex || "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}";

      // Convert LaTeX to SVG using MathJax
      const svg = latexToSvg(latexInput, false);

      // Convert SVG to PNG
      const pngBuffer = svgToPng(svg, {
        width: 600,
        background: "white",
      });

      // Convert to base64 for display
      const base64 = pngBuffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      return NextResponse.json({
        success: true,
        message: `Successfully converted LaTeX "${latexInput}" to PNG (${pngBuffer.length} bytes)`,
        imageUrl: dataUrl,
        svg: svg.substring(0, 200) + "...", // First 200 chars of SVG for debugging
      });
    }

    return NextResponse.json({
      success: false,
      message: "Unknown test type",
    });
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
