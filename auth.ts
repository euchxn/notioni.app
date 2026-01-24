import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // DB에서 Notion 연동 정보 가져오기
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            notionAccessToken: true,
            notionWorkspaceId: true,
            notionWorkspaceName: true,
            notionWorkspaceIcon: true,
          },
        });
        if (dbUser) {
          token.notionAccessToken = dbUser.notionAccessToken;
          token.notionWorkspaceId = dbUser.notionWorkspaceId;
          token.notionWorkspaceName = dbUser.notionWorkspaceName;
          token.notionWorkspaceIcon = dbUser.notionWorkspaceIcon;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.notionAccessToken = token.notionAccessToken as string | null;
        session.user.notionWorkspaceId = token.notionWorkspaceId as string | null;
        session.user.notionWorkspaceName = token.notionWorkspaceName as string | null;
        session.user.notionWorkspaceIcon = token.notionWorkspaceIcon as string | null;
      }
      return session;
    },
  },
});
