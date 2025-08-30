// src/app/api/todos/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}
function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json(details ? { ok:false, error, details } : { ok:false, error }, { status });
}

const Create = z.object({
  text: z.string().trim().min(1),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export async function GET() {
  const db = await getDb();
  const col = db.collection("todos");
  const docs = await col.find().sort({ createdAt: -1 }).toArray();
  return jsonOk(docs);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parse = Create.safeParse(body);
  if (!parse.success) return jsonError("Invalid payload", 422, parse.error.flatten());

  const now = new Date();
  const doc = {
    text: parse.data.text,
    done: false,
    dateISO: parse.data.dateISO ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  const col = db.collection("todos");
  const res = await col.insertOne(doc);
  const created = await col.findOne({ _id: res.insertedId });
  return jsonOk(created, { status: 201 });
}