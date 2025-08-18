// API called with job id
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from "zod";
import { JobStatusSchema } from '@/lib/schemas';

function oid(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// Partial updates to jobs
const JobUpdateSchema = z.object({
  status: JobStatusSchema.optional(),
  favorite: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(30).trim()).optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: "No fields to update" });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const _id = oid(params.id);
  if (!_id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = JobUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const $set = { ...parsed.data, updatedAt: new Date().toISOString() };

  try {
    const db = await getDb();
    const col = db.collection("jobs");

    const result = await col.findOneAndUpdate(
      { _id },
      { $set },
      { returnDocument: "after" } // get the updated doc back
    );

    // Handle both driver shapes safely
    const doc = (result as any)?.value ?? result;
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, data: doc }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const _id = oid(params.id);
  if (!_id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    const db = await getDb();
    const res = await db.collection("jobs").deleteOne({ _id });
    if (!res.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}