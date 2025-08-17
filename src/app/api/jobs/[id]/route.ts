// API called with job id
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { JobStatusSchema } from '@/lib/schemas'; // z.union(['applied','interview','rejected'])

function parseObjectId(id: string) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const _id = parseObjectId(params.id);
  if (!_id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = JobStatusSchema.safeParse((body as any).status);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const col = db.collection("jobs");

    const result = await col.findOneAndUpdate(
      { _id },
      { $set: { status: parsed.data, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: result.value }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const res = await db.collection("jobs").deleteOne({ _id: new ObjectId(id) });

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true }, { status: 200 }); // 🔥 simpler: always return JSON
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Bad request" }, { status: 500 });
  }
}