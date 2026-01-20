import { NextRequest, NextResponse } from "next/server";
import { generateTemplate } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "서버 설정 오류: GEMINI_API_KEY가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { description } = await request.json();

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
