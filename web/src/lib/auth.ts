import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // LINE認証プロバイダー（実際のclient_idが設定されている場合のみ有効）
    ...(process.env.LINE_CLIENT_ID && process.env.LINE_CLIENT_ID !== "test-client-id" ? [{
      id: "line",
      name: "LINE",
      type: "oauth" as const,
      authorization: {
        url: "https://access.line.me/oauth2/v2.1/authorize",
        params: {
          scope: "profile",
          response_type: "code",
        },
      },
      token: "https://api.line.me/oauth2/v2.1/token",
      userinfo: "https://api.line.me/v2/profile",
      clientId: process.env.LINE_CLIENT_ID,
      clientSecret: process.env.LINE_CLIENT_SECRET,
      idToken: false,
      checks: ["state"],
      client: {
        id_token_signed_response_alg: "HS256"
      },
      profile(profile: { userId: string; displayName: string; email?: string; pictureUrl: string }) {
        return {
          id: profile.userId,
          name: profile.displayName,
          email: profile.email || null,
          image: profile.pictureUrl,
        }
      },
    }] : []),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (user && session.user) {
        (session.user as { id?: string }).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}
