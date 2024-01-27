import { upsertTelegramUser } from "@/lib/data";
import { verifyAuthData } from "@/lib/telegram/auth";
import { TelegramUser } from "@/types/telegram";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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

export const authOptions: NextAuthOptions = {
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
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                let telegramUser: TelegramUser | null = null
                const authData = req.query
                console.log(authData)
                if (authData) {
                    telegramUser = verifyAuthData(process.env.TELEGRAM_BOT_API_TOKEN || "", authData)
                    await upsertTelegramUser(telegramUser)
                }

                if (telegramUser) {
                    // Any object returned will be saved in `user` property of the JWT
                    // The user property should match the format of the OAuth user data
                    const user = {
						id: telegramUser.id.toString(),
						email: telegramUser.id.toString(),
						name: [telegramUser.first_name, telegramUser.last_name || ""].join(" ").trim(),
						// image: telegramUser.photo_url,
					}
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, user, token }) {
            session.user.id = session.user.email;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }