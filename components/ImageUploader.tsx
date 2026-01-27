"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  onImageSelect: (image: string, mimeType: string) => void;
  onImageClear: () => void;
  selectedImage: string | null;
  disabled?: boolean;
}

export default function ImageUploader({
  onImageSelect,
  onImageClear,
  selectedImage,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      // 파일 타입 검증
      const supportedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!supportedTypes.includes(file.type)) {
        setError("지원하지 않는 형식입니다. (JPG, PNG, GIF, WebP만 지원)");
        return;
      }

      // 파일 크기 검증 (4MB)
      if (file.size > 4 * 1024 * 1024) {
        setError("이미지 크기가 너무 큽니다. (최대 4MB)");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onImageSelect(result, file.type);
      };
      reader.onerror = () => {
        setError("이미지를 읽는 중 오류가 발생했습니다.");
      };
      reader.readAsDataURL(file);
    },
    [onImageSelect]
  );

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // 클립보드 붙여넣기 핸들러
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
            break;
          }
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [disabled, processFile]);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  if (selectedImage) {
    return (
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="relative w-full h-64">
            <Image
              src={selectedImage}
              alt="선택된 템플릿 이미지"
              fill
              className="object-contain"
              unoptimized // base64 이미지는 최적화 불가
            />
          </div>
          <button
            onClick={onImageClear}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
            title="이미지 제거"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          이 이미지를 분석하여 비슷한 템플릿을 생성합니다
        </p>
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${isDragging ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-gray-700"}`}>
            <svg
              className={`w-6 h-6 ${isDragging ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              템플릿 이미지 업로드
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              드래그 앤 드롭, 클릭하여 선택, 또는 <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl+V</kbd> 붙여넣기
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        노션 페이지 스크린샷을 업로드하면 AI가 분석하여 비슷한 템플릿을 생성합니다
      </p>
    </div>
  );
}
