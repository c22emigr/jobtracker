// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import { requireAuth, toJsonError } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { TodoCreateSchema } from "@/lib/schemas";
import { ObjectId } from "mongodb";

// Database shapes
type TodoDb = {
  _id?: ObjectId;
  userId: string; // Session userId
  text: string;
  dateISO: string | null; // null for undated todos
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: Request) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated

    const col = await getCollection<TodoDb>("todos");
    const todos = await col
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  
  return NextResponse.json({ ok: true, data: todos } as const);
  } catch (e) {
    return toJsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated
    const body = await req.json().catch(() => null);

    const parsed = TodoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", details: parsed.error.flatten()},
        { status: 422 }
      );
    }

  const now = new Date();
  const doc: Omit<TodoDb, "?id"> = {
    userId,
    text: parsed.data.text,
    done: false,
    dateISO: parsed.data.dateISO ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const col = await getCollection<TodoDb>("todos");
  const { insertedId } = await col.insertOne(doc);

  return NextResponse.json(
    { ok: true, data: { _id: insertedId.toString(), ...doc } },
    { status: 201 }
  );
  } catch (e) {
    return toJsonError(e);
  }
}