// frontend/src/components/ExplanationPanel.tsx
import React, { useState } from "react";
import { getExplanation } from "../lib/api";

type Props = {
  fileId: string;
  addr: string; // or number as string
  onClose?: () => void;
};

export default function ExplanationPanel({ fileId, addr, onClose }: Props) {
  const cacheKey = `explain:${fileId}:${addr}`;

  const [explanation, setExplanation] = useState<string | null>(() => {
    try {
      return localStorage.getItem(cacheKey);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(!!explanation);

  async function fetchExplanation() {
    setError(null);
    setLoading(true);
    setFromCache(false);
    try {
      const json = await getExplanation(fileId, addr);
      const text = json.explanation ?? JSON.stringify(json);
      setExplanation(text);
      try {
        localStorage.setItem(cacheKey, text);
      } catch {
        // ignore localStorage errors
      }
      setFromCache(false);
    } catch (err: any) {
      // If cached result exists, show it as fallback and note the error
      const cached = (() => {
        try {
          return localStorage.getItem(cacheKey);
        } catch {
          return null;
        }
      })();
      if (cached) {
        setExplanation(cached);
        setFromCache(true);
        setError(`Failed to refresh explanation; showing cached result. (${err?.message ?? err})`);
      } else {
        setError(err?.message ?? "Failed to fetch explanation");
      }
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!explanation) return;
    navigator.clipboard?.writeText(explanation);
    // show small toast if you have one
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Function Explanation — {addr}</h3>
          <p className="text-sm text-gray-500">File: {fileId}</p>
        </div>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">cached</span>
          )}
          <button
            onClick={() => fetchExplanation()}
            disabled={loading}
            className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-60"
          >
            Explain Function
          </button>
          {onClose && (
            <button onClick={onClose} className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-900">
              Close
            </button>
          )}
          {explanation && (
            <button onClick={copy} className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-900">
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" strokeOpacity="0.2" />
              <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <span>Generating explanation...</span>
          </div>
        )}

        {error && (
          <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {explanation && !loading && (
          <pre className="mt-3 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md border overflow-x-auto">
            {explanation}
          </pre>
        )}

        {!explanation && !loading && !error && (
          <div className="mt-3 text-sm text-gray-500">Click “Explain Function” to get an AI explanation for this function.</div>
        )}
      </div>
    </div>
  );
}