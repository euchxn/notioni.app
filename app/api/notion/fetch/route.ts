import { NextRequest, NextResponse } from "next/server";
import { fetchNotionPage } from "@/lib/notion";

export async function POST(request: NextRequest) {
  try {
    const { notionApiKey, pageId } = (await request.json()) as {
      notionApiKey: string;
      pageId: string;
    };

    if (!notionApiKey) {
      return NextResponse.json(
        { error: "Notion API 키를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!pageId) {
      return NextResponse.json(
        { error: "페이지 ID를 입력해주세요." },
        { status: 400 }
      );
    }

    // 페이지 ID 정리 (하이픈 제거)
    const cleanPageId = pageId.replace(/-/g, "").trim();

    const template = await fetchNotionPage(notionApiKey, cleanPageId);

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Notion page fetch error:", error);

    const errorMessage = error instanceof Error ? error.message : "";

    if (
      errorMessage.includes("Could not find page") ||
      errorMessage.includes("object_not_found")
    ) {
      return NextResponse.json(
        {
          error:
            "페이지를 찾을 수 없습니다. 페이지 ID를 확인하고, Integration이 해당 페이지에 연결되어 있는지 확인해주세요.",
        },
        { status: 400 }
      );
    }

    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("Invalid token")
    ) {
      return NextResponse.json(
        { error: "API 키가 올바르지 않습니다. Integration Secret을 확인해주세요." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "노션 페이지를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
