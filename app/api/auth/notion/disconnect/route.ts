import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Notion 연결 해제
export async function POST() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notionAccessToken: null,
        notionRefreshToken: null,
        notionBotId: null,
        notionWorkspaceId: null,
        notionWorkspaceName: null,
        notionWorkspaceIcon: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notion disconnect error:", error);
    return NextResponse.json(
      { error: "연결 해제에 실패했습니다." },
      { status: 500 }
    );
  }
}
