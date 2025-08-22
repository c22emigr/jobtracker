import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from "zod";
import { JobStatusSchema } from '@/lib/schemas';

// Helper for consistent data
function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, { status: 200, ...init });
}
function jsonError(error: string, status = 400, details?: unknown) {
  return NextResponse.json(
    details ? { ok: false, error, details } : { ok: false, error },
    { status }
  );
}

function oid(id: string) { // Validate oid
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

const LettersAndSpaces = /^[\p{L}\s]+$/u;

// Partial updates to jobs through edit
const JobUpdateSchema = z.object({
  role: z.string().min(2).optional(),
  company: z.string().min(2).optional(),
  location: z.string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .regex(LettersAndSpaces, "Letters and spaces only")
    .optional(),
  note: z.string().max(250).optional(), // mirrors UI cap
  status: JobStatusSchema.optional(),
  favorite: z.boolean().optional(),
})
.strict()
.refine(obj => Object.keys(obj).length > 0, { message: "Empty body" });

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const _id = oid(id);
  if (!_id) return jsonError("Invalid id", 400);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  const parsed = JobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    const errs = parsed.error.flatten();
    return jsonError("Invalid payload", 422, errs);
  }

  // store as Date for proper sorting and indexing
  const $set = { ...parsed.data, updatedAt: new Date() };

  try {
    const db = await getDb();
    const col = db.collection("jobs");

    const doc = await col.findOneAndUpdate(
      { _id },
      { $set },
      { returnDocument: "after" }
    );

    if (!doc) return jsonError("Not found", 404);
    return jsonOk(doc);
  } catch (err) {
    console.error(err);
    return jsonError("Server error", 500);
  }
}


export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const _id = oid(id);
  if (!_id) return jsonError("Invalid id", 400);

  try {
    const db = await getDb();
    const col = db.collection("jobs");

    // return the deleted doc for consistent envelope and better UX
    const doc = await col.findOneAndDelete({ _id });
    if (!doc) return jsonError("Not found", 404);

    return jsonOk(doc);
  } catch (e: any) {
    console.error(e);
    return jsonError(e?.message ?? "Server error", 500);
  }
}