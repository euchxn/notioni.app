"use client";

import { useState } from "react";
import TemplateForm from "@/components/TemplateForm";
import TemplateEditor from "@/components/TemplateEditor";
import NotionConnect from "@/components/NotionConnect";
import NotionPageLoader from "@/components/NotionPageLoader";
import { GeneratedTemplate, TemplateBlock } from "@/lib/prompts";

type Mode = "create" | "edit";

interface EditingState {
  pageId: string;
  originalBlocks: TemplateBlock[];
  originalTitle: string;
  originalIcon?: string;
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("create");
  const [template, setTemplate] = useState<GeneratedTemplate | null>(null);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI로 새 템플릿 생성
  const handleGenerate = async (description: string) => {
    setIsLoading(true);
    setError(null);
    setTemplate(null);
    setEditingState(null);
    setMode("create");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "템플릿 생성에 실패했습니다.");
      }

      setTemplate(data.template);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Notion에서 기존 페이지 불러오기
  const handleLoadPage = (
    loadedTemplate: GeneratedTemplate & { pageId: string }
  ) => {
    setTemplate(loadedTemplate);
    setEditingState({
      pageId: loadedTemplate.pageId,
      originalBlocks: [...loadedTemplate.blocks],
      originalTitle: loadedTemplate.title,
      originalIcon: loadedTemplate.icon,
    });
    setMode("edit");
    setError(null);
  };

  // 모드 초기화
  const handleReset = () => {
    setTemplate(null);
    setEditingState(null);
    setMode("create");
    setError(null);
  };

  return (
    <div className="space-y-8">
      <section className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          AI로 노션 템플릿을 자동 생성하세요
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          원하는 템플릿을 자연어로 설명하면, AI가 자동으로 노션 템플릿 구조를
          생성합니다. 생성된 템플릿은 바로 노션에 추가할 수 있습니다.
        </p>
      </section>

      {/* 모드 선택 탭 */}
      {!template && (
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode("create")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === "create"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            새 템플릿 생성
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              mode === "edit"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            기존 페이지 수정
          </button>
        </div>
      )}

      {/* 새 템플릿 생성 모드 */}
      {mode === "create" && !template && (
        <TemplateForm onGenerate={handleGenerate} isLoading={isLoading} />
      )}

      {/* 기존 페이지 수정 모드 - 로더 */}
      {mode === "edit" && !template && (
        <NotionPageLoader onLoad={handleLoadPage} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 템플릿 편집기 */}
      {template && (
        <>
          {/* 모드 표시 및 초기화 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  editingState
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {editingState ? "기존 페이지 수정 중" : "새 템플릿"}
              </span>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← 처음으로
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingState ? "페이지 편집" : "미리보기"}
              </h3>
              <TemplateEditor template={template} onUpdate={setTemplate} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingState ? "노션에 저장" : "노션에 추가"}
              </h3>
              <NotionConnect
                template={template}
                editingState={editingState}
              />
            </div>
          </div>
        </>
      )}

      {!template && !isLoading && mode === "create" && (
        <section className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            이런 템플릿을 만들 수 있어요
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: "📋",
                title: "업무 관리",
                desc: "할일, 프로젝트, 회의록 템플릿",
              },
              {
                icon: "📚",
                title: "학습 & 독서",
                desc: "독서 기록, 강의 노트, 학습 플래너",
              },
              {
                icon: "🎯",
                title: "목표 & 습관",
                desc: "습관 트래커, 목표 설정, OKR",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 text-center"
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
