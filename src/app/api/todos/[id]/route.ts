import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";

function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok:true, data }, { status: 200, ...init });
}
function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json(details ? { ok:false, error, details } : { ok:false, error }, { status });
}
const Update = z.object({
  text: z.string().trim().min(1).optional(),
  done: z.boolean().optional(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).refine(o => Object.keys(o).length>0, { message: "Empty body" });

const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const _id = oid(params.id);
  if (!_id) return jsonError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parse = Update.safeParse(body);
  if (!parse.success) return jsonError("Invalid payload", 422, parse.error.flatten());

  const db = await getDb();
  const col = db.collection("todos");
  const doc = await col.findOneAndUpdate(
    { _id },
    { $set: { ...parse.data, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!doc) return jsonError("Not found", 404);
  return jsonOk(doc);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const _id = oid(params.id);
  if (!_id) return jsonError("Invalid id", 400);
  const db = await getDb();
  const col = db.collection("todos");
  const doc = await col.findOneAndDelete({ _id });
  if (!doc) return jsonError("Not found", 404);
  return jsonOk(doc);
}