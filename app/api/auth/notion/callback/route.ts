import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Notion OAuth 콜백 처리
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/?error=not_authenticated", request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !clientSecret || !appUrl) {
    return NextResponse.redirect(new URL("/?error=config_error", request.url));
  }

  const redirectUri = `${appUrl}/api/auth/notion/callback`;

  try {
    // code를 access_token으로 교환
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${encoded}`,
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Notion token exchange error:", errorData);
      return NextResponse.redirect(new URL("/?error=token_exchange_failed", request.url));
    }

    const tokenData = await tokenResponse.json();

    // DB에 Notion 토큰 저장
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        notionAccessToken: tokenData.access_token,
        notionRefreshToken: tokenData.refresh_token,
        notionBotId: tokenData.bot_id,
        notionWorkspaceId: tokenData.workspace_id,
        notionWorkspaceName: tokenData.workspace_name,
        notionWorkspaceIcon: tokenData.workspace_icon,
      },
    });

    // 성공 시 메인 페이지로 리다이렉트
    return NextResponse.redirect(new URL("/?notion=connected", request.url));
  } catch (error) {
    console.error("Notion OAuth callback error:", error);
    return NextResponse.redirect(new URL("/?error=callback_error", request.url));
  }
}
