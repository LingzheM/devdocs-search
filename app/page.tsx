"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

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

type FacetCount = {
  field_name: string;
  counts: {
    value: string;
    count: number;
  }[];
};

type SearchResponse = {
  found: number;
  hits: Hit[];
  search_time_ms: number;
  facet_counts: FacetCount[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    search(debouncedQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const search = async (q: string, category: string = selectedCategory, level: string = selectedLevel) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({ q });
    if (category) params.set("category", category);
    if (level) params.set("level", level);

    const res = await fetch(`/api/search?${params.toString()}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const handleCatgoryClick = (value: string) => {
    const next = selectedCategory === value ? "" : value;
    setSelectedCategory(next);
    search(query, next, selectedLevel);
  }

  const handleLevelClick = (value: string) => {
    const next = selectedLevel === value ? "" : value;
    setSelectedLevel(next);
    search(query, selectedCategory, next);
  };

  // facet_counts数组里找指定字段
  const getFacet = (fieldName: string) => results?.facet_counts?.find((f) => f.field_name === fieldName);

  const levelOrder = ["beginner", "intermediate", "advanced"]

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        DevDocs Search
      </h1>

      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
      placeholder="Search docs...(try 'react', 'typescript', 'async')"
      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus-ring-blue-500"
      />

      {results && (
        <p className="text-sm text-gray-500 mt-3">
          {results.found} results ({results.search_time_ms}ms)
          { selectedCategory && (
            <span className="ml-2 text-blue-600">in {selectedCategory}</span>
          ) }
          { selectedLevel && (
            <span className="ml-2 text-blue-600">· {selectedLevel} </span>
          ) }
        </p>
      )}

      <div className="flex gap-6 mt-4">
        { results && results.facet_counts?.length > 0 && (
          <aside className="w-48 shrink-0 space-y-6">
            {getFacet("category") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                <ul className="space-y-1">
                  {getFacet("category")!.counts.map(({ value, count }) => (
                    <li key={value}>
                      <button
                        onClick={() => handleCatgoryClick(value)}
                        className={`w-full text-left text-sm px-2 py-1 rounded flex justify-between items-center transition-colors ${
                          selectedCategory === value ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{value}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {getFacet("level") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Level</h3>
                <ul className="space-y-1">
                  {getFacet("level")!.counts.sort((a, b) => levelOrder.indexOf(a.value) - levelOrder.indexOf(b.value)).map(({ value, count }) => (
                    <li key={value}>
                      <button
                        onClick={() => handleLevelClick(value)}
                        className={`w-full text-left text-sm px-2 py-1 rounded flex justify-between items-center transition-colors ${
                          selectedLevel === value ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <span>{value}</span>
                        <span className="text-xs text-gray-400">{count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        ) }
      </div>
      
      <div className="flex-1 space-y-4">
        {loading && (
          <p className="text-sm text-gray-400 mt-3">Searching...</p>
        )}

        {results?.hits.map((hit) => (
          <div key={hit.document.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
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