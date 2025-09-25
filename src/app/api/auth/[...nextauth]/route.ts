import NextAuth, { NextAuthOptions } from "next-auth";
import Github from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";


export const authOptions: NextAuthOptions = { 
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },   // Stateless sessions with JWT
    providers: [
        Github({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
    ],
    callbacks: { 
        async jwt({ token, user }) {
            // add MongoDB userid to the token for first time login
            if (user) token.uid = user.id;
            return token;
        },
        async session({ session, token }) {
            // add MongoDB userid to session
            session.user.id = token.uid;
            return session;
        },
    },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };