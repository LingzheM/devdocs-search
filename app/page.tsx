"use client";

import { useState } from "react";

// 定义搜索结果类型
type Hit = {
  document: {
    id: string;
    title: string;
    content: string;
    category: string;
    level: string;
    url: string;
  };
  highlight: {
    title?: {snippet: string};
    content?: {snippet: string};
  };
};

type SearchResponse = {
  found: number;
  hits: Hit[];
  search_time_ms: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        DevDocs Search
      </h1>

      <input type="text" value={query} onChange={(e) => {
        setQuery(e.target.value);
        search(e.target.value);
      }}
      placeholder="Search docs...(try 'react', 'typescript', 'async')"
      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
      />

      {results && (
        <p className="text-sm text-gray-500 mt-3">
          {results.found} results ({results.search_time_ms}ms)
        </p>
      )}

      {loading && (
        <p className="text-sm text-gray-400 mt-3">Searching...</p>
      )}

      <div className="mt-4 space-y-4">
        {results?.hits.map((hit) => (
          <div
            key={hit.document.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
            <a
              href={hit.document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 hover:underline"
              dangerouslySetInnerHTML={{
                __html: hit.highlight.title?.snippet || hit.document.title,
              }}
            />

            <div className="flex gap-2 mt-1">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {hit.document.category}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {hit.document.level}
              </span>
            </div>

            <p
              className="text-sm text-gray-600 mt-2"
              dangerouslySetInnerHTML={{
                __html: hit.highlight.content?.snippet || hit.document.content,
              }}
            />
          </div>
        ))}
      </div>

      {results && results.found === 0 && (
        <p className="text-center text-gray-400 mt-8">
          No results found for "{query}"
        </p>
      )}
    </main>
  )
}