"use client";

import { useState } from "react";

export default function TestLatexPage() {
  const [text, setText] = useState(
    "The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ and Einstein's famous equation is $$E = mc^2$$",
  );
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLatexRendering = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/test-latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to render LaTeX");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-4 text-2xl font-bold">LaTeX Rendering Test (Vercel)</h1>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium">
          Enter text with LaTeX equations:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[100px] w-full rounded border p-2"
          placeholder="Enter text with $inline$ or $$display$$ LaTeX"
        />
      </div>

      <button
        onClick={testLatexRendering}
        disabled={loading}
        className="bg-blue-500 rounded px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Rendering..." : "Test LaTeX Rendering"}
      </button>

      {error && (
        <div className="mt-4 rounded bg-red-100 p-4 text-red-700">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">Results:</h2>

          <div className="mb-4">
            <h3 className="font-medium">
              Found {result.patterns?.length || 0} LaTeX patterns:
            </h3>
            <ul className="list-inside list-disc">
              {result.patterns?.map((p: any, i: number) => (
                <li key={i}>
                  {p.type}: <code>{p.latex}</code>
                </li>
              ))}
            </ul>
          </div>

          {result.firstPatternRendered && (
            <div className="mb-4">
              <h3 className="font-medium">First pattern rendered:</h3>
              <p>
                LaTeX: <code>{result.firstPatternRendered.latex}</code>
              </p>
              <p>Type: {result.firstPatternRendered.type}</p>
              <p>Size: {result.firstPatternRendered.size} bytes</p>
              <div className="mt-2">
                <img
                  src={result.firstPatternRendered.dataUri}
                  alt="Rendered LaTeX"
                  className="border bg-white p-2"
                />
              </div>
            </div>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer">Raw Response</summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
