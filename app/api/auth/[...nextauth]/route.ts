import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { objectToAuthDataMap, AuthDataValidator } from "@telegram-auth/server";

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
                const validator = new AuthDataValidator({
                    botToken: `${process.env.BOT_TOKEN}`,
                });

                const data = objectToAuthDataMap(req.query || {});
                const user = await validator.validate(data);

                if (user.id && user.first_name) {
                    const returned = {
                        id: user.id.toString(),
                        email: user.id.toString(),
                        name: [user.first_name, user.last_name || ""].join(" "),
                        image: user.photo_url,
                    };

                    try {
                        await createUserOrUpdate(user);
                    } catch {
                        console.log(
                            "Something went wrong while creating the user."
                        );
                    }

                    return returned;
                }
                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
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
    pages: {
        signIn: "/auth/signin",
    },
};

const handlers = NextAuth(authOptions);
export const { GET, POST } = handlers