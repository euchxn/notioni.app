"use client";

import { useState } from "react";
import ImageUploader from "./ImageUploader";

interface TemplateFormProps {
  onGenerate: (description: string, image?: string, mimeType?: string) => Promise<void>;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "주간 업무 관리 템플릿. 할일 체크리스트, 우선순위, 마감일이 필요해요",
  "독서 기록 템플릿. 책 제목, 저자, 읽은 날짜, 별점, 메모를 기록하고 싶어요",
  "프로젝트 관리 템플릿. 마일스톤, 담당자, 진행상태를 추적할 수 있으면 좋겠어요",
  "습관 트래커 템플릿. 매일 체크할 수 있는 습관 목록이 필요해요",
];

export default function TemplateForm({
  onGenerate,
  isLoading,
}: TemplateFormProps) {
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "image">("text");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    // 이미지 모드: 이미지가 있으면 생성 가능
    if (inputMode === "image" && selectedImage && imageMimeType) {
      await onGenerate(description, selectedImage, imageMimeType);
      return;
    }

    // 텍스트 모드: 설명이 있으면 생성 가능
    if (inputMode === "text" && description.trim()) {
      await onGenerate(description);
    }
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
    setInputMode("text");
  };

  const handleImageSelect = (image: string, mimeType: string) => {
    setSelectedImage(image);
    setImageMimeType(mimeType);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setImageMimeType(null);
  };

  const canSubmit = inputMode === "image" 
    ? selectedImage !== null 
    : description.trim().length >= 10;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        어떤 템플릿을 만들어 드릴까요?
      </h2>

      {/* 입력 모드 선택 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setInputMode("text")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "text"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            텍스트로 설명
          </span>
        </button>
        <button
          type="button"
          onClick={() => setInputMode("image")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            inputMode === "image"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            이미지로 생성
          </span>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {inputMode === "text" ? (
          // 텍스트 입력 모드
          <>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="원하는 템플릿을 자유롭게 설명해주세요. 예: 주간 업무 관리 템플릿이 필요해요. 할일 체크리스트와 우선순위가 있었으면 좋겠어요."
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 transition-colors"
              disabled={isLoading}
            />

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {description.length > 0 && `${description.length}자`}
              </span>
              <button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
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
                    생성 중...
                  </span>
                ) : (
                  "템플릿 생성"
                )}
              </button>
            </div>
          </>
        ) : (
          // 이미지 입력 모드
          <>
            <ImageUploader
              onImageSelect={handleImageSelect}
              onImageClear={handleImageClear}
              selectedImage={selectedImage}
              disabled={isLoading}
            />

            {/* 이미지 선택 시 추가 설명 입력 (선택사항) */}
            {selectedImage && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  추가 요청사항 (선택)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 색상을 파란색 계열로 변경해주세요, 체크박스를 더 추가해주세요"
                  className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 transition-colors text-sm"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || !canSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
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
                    분석 중...
                  </span>
                ) : (
                  "이미지 분석하여 생성"
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* 예시 프롬프트 - 텍스트 모드일 때만 표시 */}
      {inputMode === "text" && (
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">예시 프롬프트:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {example.slice(0, 25)}...
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
