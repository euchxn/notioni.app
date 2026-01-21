"use client";

import { useState, useEffect } from "react";
import { GeneratedTemplate } from "@/lib/prompts";

interface NotionPageLoaderProps {
  onLoad: (template: GeneratedTemplate & { pageId: string }, apiKey: string) => void;
}

const STORAGE_KEY = "notion_settings";

export default function NotionPageLoader({ onLoad }: NotionPageLoaderProps) {
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { apiKey: savedKey } = JSON.parse(saved);
        if (savedKey) setApiKey(savedKey);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLoad = async () => {
    if (!apiKey.trim() || !pageId.trim()) {
      setError("API 키와 페이지 ID를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // API 키 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey }));

    try {
      const response = await fetch("/api/notion/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notionApiKey: apiKey.trim(),
          pageId: pageId.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onLoad(data.template, apiKey.trim());
      } else {
        setError(data.error || "페이지를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Failed to load page:", error);
      setError("페이지를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          노션 페이지 불러오기
        </h2>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showHelp ? "도움말 닫기" : "설정 방법?"}
        </button>
      </div>

      {showHelp && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 space-y-3">
          <div>
            <p className="font-semibold mb-1">1. Notion Integration 만들기</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  notion.so/my-integrations
                </a>
                {" "}접속
              </li>
              <li>&quot;New integration&quot; 클릭</li>
              <li>이름 입력 후 생성</li>
              <li>&quot;Internal Integration Secret&quot; 복사</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold mb-1">2. 페이지에 Integration 연결</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>수정할 노션 페이지 열기</li>
              <li>우측 상단 &quot;...&quot; 클릭 → &quot;Connections&quot;</li>
              <li>만든 Integration 선택하여 연결</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold mb-1">3. 페이지 ID 찾기</p>
            <p className="ml-4">
              페이지 URL에서 마지막 32자리가 페이지 ID입니다.
              <br />
              <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded text-xs">
                notion.so/페이지이름-<span className="text-blue-600 dark:text-blue-400 font-bold">abc123def456...</span>
              </code>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notion API Key (Integration Secret)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            페이지 ID (수정할 페이지)
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="abc123def456789..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleLoad}
          disabled={isLoading || !apiKey.trim() || !pageId.trim()}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              불러오는 중...
            </span>
          ) : (
            "페이지 불러오기"
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          입력한 정보는 브라우저에 저장되며 서버에 저장되지 않습니다.
        </p>
      </div>
    </div>
  );
}
