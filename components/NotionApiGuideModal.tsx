"use client";

import { useState, useEffect } from "react";

interface NotionApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideInstruction {
  text: string;
  link?: string;
}

interface GuideStep {
  title: string;
  description: string;
  instructions: GuideInstruction[];
  tip?: string;
  example?: {
    url: string;
    highlight: string;
    description: string;
  };
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "Notion Integration 만들기",
    description: "먼저 Notion에서 Integration(통합)을 생성해야 합니다.",
    instructions: [
      {
        text: "notion.so/my-integrations 접속",
        link: "https://www.notion.so/my-integrations",
      },
      { text: '"새 API 통합" 또는 "New integration" 버튼 클릭' },
      { text: "Integration 이름 입력 (예: Template AI)" },
      { text: '"제출" 또는 "Submit" 클릭하여 생성' },
    ],
  },
  {
    title: "API 키 복사하기",
    description: "생성된 Integration에서 API 키(Secret)를 복사합니다.",
    instructions: [
      { text: "생성된 Integration 클릭" },
      { text: '"시크릿" 또는 "Internal Integration Secret" 영역 찾기' },
      { text: '"표시" 버튼을 클릭하여 키 확인' },
      { text: '"복사" 버튼으로 API 키 복사' },
    ],
    tip: "API 키는 'secret_'으로 시작합니다. 이 키는 안전하게 보관하세요!",
  },
  {
    title: "페이지에 Integration 연결하기",
    description: "템플릿을 추가할 페이지에 Integration 권한을 부여합니다.",
    instructions: [
      { text: "Notion에서 템플릿을 추가할 페이지 열기" },
      { text: "우측 상단 ••• (더보기) 버튼 클릭" },
      { text: '"연결" 또는 "Connections" 메뉴 선택' },
      { text: "방금 만든 Integration 이름 검색 후 선택" },
    ],
    tip: "하위 페이지에도 자동으로 권한이 적용됩니다.",
  },
  {
    title: "페이지 ID 찾기",
    description: "템플릿을 생성할 페이지의 ID를 찾습니다.",
    instructions: [
      { text: "템플릿을 추가할 페이지 열기" },
      { text: "브라우저 주소창에서 URL 확인" },
      { text: "URL의 마지막 32자리 문자가 페이지 ID입니다" },
    ],
    example: {
      url: "notion.so/My-Page-abc123def456789...",
      highlight: "abc123def456789...",
      description: "← 이 부분이 페이지 ID",
    },
  },
];

export default function NotionApiGuideModal({
  isOpen,
  onClose,
}: NotionApiGuideModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const step = GUIDE_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === GUIDE_STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-lg max-h-[90vh] mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notion API 설정 가이드
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              단계 {currentStep + 1} / {GUIDE_STEPS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 진행 바 */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / GUIDE_STEPS.length) * 100}%`,
            }}
          />
        </div>

        {/* 본문 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 단계 제목 */}
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {step.description}
            </p>
          </div>

          {/* 단계별 지시사항 */}
          <div className="space-y-3 mb-5">
            {step.instructions.map((instruction, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-600 text-white text-sm font-medium rounded-full">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  {instruction.link ? (
                    <a
                      href={instruction.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      {instruction.text} ↗
                    </a>
                  ) : (
                    <span className="text-gray-700 dark:text-gray-300">
                      {instruction.text}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 예시 (페이지 ID 단계) */}
          {step.example && (
            <div className="mb-5 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                예시
              </p>
              <div className="font-mono text-sm bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700 break-all">
                <span className="text-gray-500 dark:text-gray-400">
                  {step.example.url.split(step.example.highlight)[0]}
                </span>
                <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-800/50 px-1 rounded">
                  {step.example.highlight}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {step.example.description}
              </p>
            </div>
          )}

          {/* 팁 */}
          {step.tip && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 text-lg">💡</span>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  {step.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 네비게이션 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={isFirstStep}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isFirstStep
                ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            ← 이전
          </button>

          {/* 단계 인디케이터 */}
          <div className="flex gap-2">
            {GUIDE_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === currentStep
                    ? "bg-blue-600"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`${idx + 1}단계로 이동`}
              />
            ))}
          </div>

          {isLastStep ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              완료
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              다음 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
