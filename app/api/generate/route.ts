import { NextRequest, NextResponse } from "next/server";
import { generateTemplate, generateTemplateFromImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "서버 설정 오류: GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { description, image, mimeType } = body;

    // 이미지가 있는 경우 - 이미지 분석으로 템플릿 생성
    if (image && mimeType) {
      // base64 데이터에서 data:image/... 부분 제거
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
      
      // 지원하는 이미지 형식 확인
      const supportedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!supportedFormats.includes(mimeType)) {
        return NextResponse.json(
          { error: "지원하지 않는 이미지 형식입니다. (JPG, PNG, GIF, WebP만 지원)" },
          { status: 400 }
        );
      }

      // 이미지 크기 제한 (약 4MB - base64는 원본보다 33% 큼)
      if (base64Data.length > 5.5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "이미지 크기가 너무 큽니다. (최대 4MB)" },
          { status: 400 }
        );
      }

      const template = await generateTemplateFromImage(
        base64Data,
        mimeType,
        description // 추가 설명이 있으면 함께 전달
      );

      return NextResponse.json({ template });
    }

    // 이미지가 없는 경우 - 텍스트 설명으로 템플릿 생성
    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "템플릿 설명을 입력해주세요." },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: "템플릿 설명을 더 자세히 입력해주세요. (최소 10자)" },
        { status: 400 }
      );
    }

    const template = await generateTemplate(description);

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Template generation error:", error);

    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";

    // API 키 관련 에러
    if (errorMessage.includes("API_KEY") || errorMessage.includes("API key")) {
      return NextResponse.json(
        { error: "Gemini API 키가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // JSON 파싱 에러
    if (errorMessage.includes("파싱") || errorMessage.includes("JSON")) {
      return NextResponse.json(
        { error: "AI 응답 처리 중 오류가 발생했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `템플릿 생성 중 오류: ${errorMessage}` },
      { status: 500 }
    );
  }
}
