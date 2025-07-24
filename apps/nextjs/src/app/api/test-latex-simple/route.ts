import { findLatexPatterns, renderLatexToPng } from "@oakai/exports";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Simple test
    const patterns = findLatexPatterns("Test: $x = 1$");

    return NextResponse.json({
      success: true,
      message: "LaTeX packages loaded successfully",
      test: {
        patternsFound: patterns.length,
        firstPattern: patterns[0] || null,
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load LaTeX packages",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
