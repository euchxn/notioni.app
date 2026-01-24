"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { GeneratedTemplate, TemplateBlock } from "@/lib/prompts";
import NotionApiGuideModal from "./NotionApiGuideModal";

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
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState("");
  const [pageId, setPageId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [useManualKey, setUseManualKey] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    url?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const isEditMode = !!editingState;
  const isNotionConnected = !!session?.user?.notionAccessToken;

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
    if (useManualKey) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ apiKey, pageId: isEditMode ? undefined : pageId })
      );
    }
  };

  // 새 페이지 생성
  const handleCreate = async () => {
    // OAuth 연동 시 pageId만 필요
    if (!isNotionConnected || useManualKey) {
      if (!apiKey.trim() || !pageId.trim()) {
        setResult({
          success: false,
          error: "API 키와 페이지 ID를 모두 입력해주세요.",
        });
        return;
      }
    } else if (!pageId.trim()) {
      setResult({
        success: false,
        error: "페이지 ID를 입력해주세요.",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);
    saveSettings();

    try {
      const body: Record<string, unknown> = {
        template,
        pageId: pageId.trim(),
      };

      // OAuth 연동 시 useOAuth 플래그, 아니면 API 키 전송
      if (isNotionConnected && !useManualKey) {
        body.useOAuth = true;
      } else {
        body.notionApiKey = apiKey.trim();
      }

      const response = await fetch("/api/notion/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    if (!isNotionConnected || useManualKey) {
      if (!apiKey.trim() || !editingState) {
        setResult({
          success: false,
          error: "API 키가 필요합니다.",
        });
        return;
      }
    }

    if (!editingState) return;

    setIsProcessing(true);
    setResult(null);
    saveSettings();

    try {
      const body: Record<string, unknown> = {
        pageId: editingState.pageId,
        title: template.title,
        icon: template.icon,
        originalBlocks: editingState.originalBlocks,
        newBlocks: template.blocks,
      };

      if (isNotionConnected && !useManualKey) {
        body.useOAuth = true;
      } else {
        body.notionApiKey = apiKey.trim();
      }

      const response = await fetch("/api/notion/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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

  // OAuth 연동 안내
  const handleConnectNotion = () => {
    window.location.href = "/api/auth/notion";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditMode ? "변경사항 저장" : "노션에 템플릿 생성하기"}
        </h3>
        {!isEditMode && (useManualKey || !isNotionConnected) && (
          <button
            onClick={() => setShowGuideModal(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            설정 가이드
          </button>
        )}
      </div>

      {/* OAuth 연동 상태 표시 */}
      {isNotionConnected && !useManualKey && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-green-800 dark:text-green-300">
                {session?.user?.notionWorkspaceIcon && (
                  <span className="mr-1">{session.user.notionWorkspaceIcon}</span>
                )}
                {session?.user?.notionWorkspaceName || "Notion"} 연결됨
              </span>
            </div>
            <button
              onClick={() => setUseManualKey(true)}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            >
              수동 입력으로 전환
            </button>
          </div>
        </div>
      )}

      {/* OAuth 미연동 시 연동 유도 */}
      {!isNotionConnected && !useManualKey && session && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
            Notion 계정을 연결하면 API 키 없이 바로 사용할 수 있어요.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConnectNotion}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Notion 연결하기
            </button>
            <button
              onClick={() => setUseManualKey(true)}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:underline"
            >
              API 키로 계속
            </button>
          </div>
        </div>
      )}

      {/* 수동 입력 모드로 전환 시 */}
      {useManualKey && isNotionConnected && (
        <div className="mb-4">
          <button
            onClick={() => setUseManualKey(false)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← 연결된 Notion 계정 사용
          </button>
        </div>
      )}

      {/* 가이드 모달 */}
      <NotionApiGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />

      <div className="space-y-4">
        {/* API 키 입력 - 수동 모드이거나 OAuth 미연동 시 */}
        {(useManualKey || !isNotionConnected) && (
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
        )}

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
            {isNotionConnected && !useManualKey && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                OAuth 인증 시 선택한 페이지에만 접근 가능합니다.
              </p>
            )}
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
            ((useManualKey || !isNotionConnected) && !apiKey.trim()) ||
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

        {(useManualKey || !isNotionConnected) && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            입력한 정보는 브라우저에 저장되며 서버에 저장되지 않습니다.
          </p>
        )}
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
