import { NextRequest, NextResponse } from "next/server";
import { updateNotionBlocks, updateNotionPageProperties } from "@/lib/notion";
import { TemplateBlock } from "@/lib/prompts";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const {
      notionApiKey,
      pageId,
      title,
      icon,
      originalBlocks,
      newBlocks,
      useOAuth,
    } = (await request.json()) as {
      notionApiKey?: string;
      pageId: string;
      title: string;
      icon?: string;
      originalBlocks: TemplateBlock[];
      newBlocks: TemplateBlock[];
      useOAuth?: boolean;
    };

    // OAuth 사용 시 세션에서 토큰 가져오기
    let accessToken = notionApiKey;
    if (useOAuth) {
      const session = await auth();
      if (!session?.user?.notionAccessToken) {
        return NextResponse.json(
          { error: "Notion 계정이 연결되지 않았습니다." },
          { status: 401 }
        );
      }
      accessToken = session.user.notionAccessToken;
    }

    if (!accessToken) {
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

    // 페이지 ID 정리
    const cleanPageId = pageId.replace(/-/g, "").trim();

    // 1. 페이지 제목/아이콘 업데이트
    await updateNotionPageProperties(accessToken!, cleanPageId, title, icon);

    // 2. 블록 업데이트
    await updateNotionBlocks(
      accessToken!,
      cleanPageId,
      originalBlocks,
      newBlocks
    );

    return NextResponse.json({
      success: true,
      message: "페이지가 성공적으로 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("Notion page update error:", error);

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
      { error: "노션 페이지 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
