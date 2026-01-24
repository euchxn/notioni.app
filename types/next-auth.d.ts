import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      notionAccessToken?: string | null;
      notionWorkspaceId?: string | null;
      notionWorkspaceName?: string | null;
      notionWorkspaceIcon?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    notionAccessToken?: string | null;
    notionWorkspaceId?: string | null;
    notionWorkspaceName?: string | null;
    notionWorkspaceIcon?: string | null;
  }
}
