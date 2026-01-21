"use client";

import { useState, useEffect } from "react";
import { GeneratedTemplate, TemplateBlock } from "@/lib/prompts";

interface EditingState {
  pageId: string;
  originalBlocks: TemplateBlock[];
  originalTitle: string;
  originalIcon?: string;
}

interface NotionConnectProps {
  template: GeneratedTemplate;
  editingState?: EditingState | null;
}

const STORAGE_KEY = "notion_settings";

export default function NotionConnect({
  template,
  editingState,
}: NotionConnectProps) {
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    url?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const isEditMode = !!editingState;

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { apiKey: savedKey, pageId: savedPageId } = JSON.parse(saved);
        if (savedKey) setApiKey(savedKey);
        if (savedPageId && !isEditMode) setPageId(savedPageId);
      } catch (e) {
        // ignore
      }
    }
    // 편집 모드면 pageId 설정
    if (editingState) {
      setPageId(editingState.pageId);
    }
  }, [editingState, isEditMode]);

  // 설정 저장
  const saveSettings = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ apiKey, pageId: isEditMode ? undefined : pageId })
    );
  };

  // 새 페이지 생성
  const handleCreate = async () => {
    if (!apiKey.trim() || !pageId.trim()) {
      setResult({
        success: false,
        error: "API 키와 페이지 ID를 모두 입력해주세요.",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    saveSettings();

    try {
      const response = await fetch("/api/notion/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template,
          notionApiKey: apiKey.trim(),
          pageId: pageId.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, url: data.url });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      console.error("Failed to create page:", error);
      setResult({ success: false, error: "페이지 생성에 실패했습니다." });
    } finally {
      setIsProcessing(false);
    }
  };

  // 기존 페이지 업데이트
  const handleUpdate = async () => {
    if (!apiKey.trim() || !editingState) {
      setResult({
        success: false,
        error: "API 키가 필요합니다.",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    saveSettings();

    try {
      const response = await fetch("/api/notion/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notionApiKey: apiKey.trim(),
          pageId: editingState.pageId,
          title: template.title,
          icon: template.icon,
          originalBlocks: editingState.originalBlocks,
          newBlocks: template.blocks,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "페이지가 성공적으로 업데이트되었습니다!",
        });
      } else {
        setResult({ success: false, error: data.error });
      }
    } catch (error) {
      console.error("Failed to update page:", error);
      setResult({ success: false, error: "페이지 업데이트에 실패했습니다." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "변경사항 저장" : "노션에 템플릿 생성하기"}
        </h3>
        {!isEditMode && (
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showHelp ? "도움말 닫기" : "설정 방법?"}
          </button>
        )}
      </div>

      {showHelp && !isEditMode && (
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
              <li>템플릿을 추가할 노션 페이지 열기</li>
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
                notion.so/페이지이름-
                <span className="text-blue-600 dark:text-blue-400 font-bold">abc123def456...</span>
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

        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              페이지 ID (템플릿을 추가할 페이지)
            </label>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="abc123def456789..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 text-sm transition-colors"
            />
          </div>
        )}

        {isEditMode && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>수정 중인 페이지:</strong>{" "}
              <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                {editingState.pageId.slice(0, 8)}...
              </code>
            </p>
          </div>
        )}

        <button
          onClick={isEditMode ? handleUpdate : handleCreate}
          disabled={
            isProcessing ||
            !apiKey.trim() ||
            (!isEditMode && !pageId.trim())
          }
          className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed ${
            isEditMode
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isProcessing ? (
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
              {isEditMode ? "저장 중..." : "생성 중..."}
            </span>
          ) : isEditMode ? (
            "변경사항 저장"
          ) : (
            "노션에 템플릿 생성"
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          입력한 정보는 브라우저에 저장되며 서버에 저장되지 않습니다.
        </p>
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            result.success
              ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
          }`}
        >
          {result.success ? (
            <div>
              <p className="text-green-800 dark:text-green-300 font-medium">
                {result.message || "템플릿이 성공적으로 생성되었습니다!"}
              </p>
              {result.url && (
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                >
                  노션에서 확인하기 →
                </a>
              )}
            </div>
          ) : (
            <p className="text-red-800 dark:text-red-300">{result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
