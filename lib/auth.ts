import { TelegramUser } from "@/types/telegram";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyAuthData } from "./telegram/auth";
import { upsertTelegramUser } from "./data";
import NextAuth, { NextAuthConfig } from "next-auth";
import querystring from 'node:querystring';


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      image: string;
      email: string;
    };
  }
}

export const config = {
  theme: {
    logo: "https://next-auth.js.org/img/logo/logo-sm.png",
  },
  providers: [
    CredentialsProvider({
      id: "telegram-login",
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Telegram",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {},
      async authorize(credentials, request: Request) {
        // Add logic here to look up the user from the credentials supplied
        let telegramUser: TelegramUser | null = null
        const url = new URL(request.url)
        // trim the beginning question mark before parsing the query
        const authData = querystring.parse(url.search.substring(1))
        if (authData) {
          telegramUser = verifyAuthData(process.env.TELEGRAM_BOT_API_TOKEN || "", authData)
          const account = await upsertTelegramUser(telegramUser)
          if (account) {
            // Any object returned will be saved in `user` property of the JWT
            // The user property should match the format of the OAuth user data
            const user = {
              id: account._id.toString(),
              email: account._id.toString(),
              name: [telegramUser.first_name, telegramUser.last_name || ""].join(" ").trim(),
              // image: telegramUser.photo_url,
            }
            return user
          }
        }

        // If you return null then an error will be displayed advising the user to check their details.
        return null

        // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      // assign id field for telegram provider
      session.user.id = session.user.email
      return session;
    },
  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)