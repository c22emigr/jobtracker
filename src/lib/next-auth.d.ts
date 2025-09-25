import { DefaultSession } from "next-auth";

// Augment session to use session.user.id for MongoDB user id
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
        id: string;
    } & DefaultSession["user"];
  }

  // Optional to access userid in callbacks
    interface User {
        id: string; // MongoDB user id
    }
  }

// Augment JWT to include MongoDB user id
declare module "next-auth/jwt" {
  interface JWT {
    uid: string; // MongoDB user id
  }
}