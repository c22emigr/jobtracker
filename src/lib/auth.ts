import { getServerSession, type Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Get current NextAuth session on server
export function getSession() {
  return getServerSession(authOptions);
}

// Get current userId from session or null if not logged in
export async function getUserId(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.user.id || null;
}

// Require user to be logged in. Returns userId and session.
export async function requireUserId() {
    const session = await getSession();
    const userId = session?.user.id;
    if (!userId) {
        throw new Error("Not authenticated");
    }
    return { userId, session };
}

// Guard for API routes to require authentication
export async function requireAuth(): Promise<{ userId: string; session: Session }> {
    const session = await getSession();
    const userId = session?.user.id;
    if (!userId) {
        throw new UnauthorizedError();
    }
    return ({ userId, session });
}

// Error class for 401 Unauthorized
export class UnauthorizedError extends Error {
    constructor() {
        super("Not authenticated");
        this.name = "UnauthorizedError";
    }
}

export function toJsonError(e: any) {
    if (e instanceof UnauthorizedError) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 401 });
}
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
}

