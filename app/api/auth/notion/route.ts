import { NextResponse } from "next/server";

// Notion OAuth 인증 페이지로 리다이렉트
export async function GET() {
  const clientId = process.env.NOTION_CLIENT_ID;
  const redirectUri = process.env.NOTION_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Notion OAuth가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("owner", "user");

  return NextResponse.redirect(authUrl.toString());
}
