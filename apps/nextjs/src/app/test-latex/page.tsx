"use client";

import { useState } from "react";

export default function TestLatexPage() {
  const [loading, setLoading] = useState(false);
  const [latexInput, setLatexInput] = useState("2x + 3 = 13");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    imageUrl?: string;
    svg?: string;
  } | null>(null);

  const testSvgToPng = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "svg-to-png" }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testLatexToSvgToPng = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          test: "latex-to-svg-to-png",
          latex: latexInput,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">LaTeX Rendering Test</h1>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="mb-2 text-xl font-semibold">
            Test 1: SVG to PNG Conversion
          </h2>
          <p className="mb-4 text-gray-600">
            Tests if @resvg/resvg-js works correctly on Vercel
          </p>

          <button
            onClick={testSvgToPng}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 text-white disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Test SVG to PNG"}
          </button>
        </div>

        <div className="border-b pb-4">
          <h2 className="mb-2 text-xl font-semibold">
            Test 2: LaTeX to SVG to PNG Conversion
          </h2>
          <p className="mb-4 text-gray-600">
            Tests MathJax v4 LaTeX rendering and conversion to PNG
          </p>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              LaTeX Expression:
            </label>
            <input
              type="text"
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              className="focus:ring-blue-500 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2"
              placeholder="Enter LaTeX expression (e.g., x^2 + y^2 = r^2)"
            />
            <p className="mt-2 text-sm text-gray-500">
              Examples:
              <button
                onClick={() =>
                  setLatexInput("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}")
                }
                className="text-blue-600 ml-2 hover:underline"
              >
                Quadratic Formula
              </button>
              <button
                onClick={() => setLatexInput("°C = \\frac{5}{9}(°F - 32)")}
                className="text-blue-600 ml-2 hover:underline"
              >
                Temperature Conversion
              </button>
              <button
                onClick={() => setLatexInput("E = mc^2")}
                className="text-blue-600 ml-2 hover:underline"
              >
                E=mc²
              </button>
            </p>
          </div>

          <button
            onClick={testLatexToSvgToPng}
            disabled={loading}
            className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Testing..." : "Test LaTeX → SVG → PNG"}
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 rounded p-4 ${result.success ? "bg-green-100" : "bg-red-100"}`}
          >
            <p
              className={`font-semibold ${result.success ? "text-green-800" : "text-red-800"}`}
            >
              {result.success ? "✅ Success" : "❌ Failed"}
            </p>
            <p className="mt-2">{result.message}</p>
            {result.imageUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Generated image:</p>
                <img
                  src={result.imageUrl}
                  alt="Generated equation"
                  className="mt-2 border border-gray-300"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
