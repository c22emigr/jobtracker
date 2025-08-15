import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { JobApplicationSchema } from "@/lib/schemas";
import type { JobApplication } from "@/lib/types.ts";

// GET: fetch all jobs
export async function GET() {
  const db = await getDb();
  const jobs = await db
    .collection<JobApplication>("jobs")
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(jobs);
}

// POST: add new job
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = JobApplicationSchema.parse({
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const db = await getDb();
    const result = await db.collection("jobs").insertOne(parsed);

    return NextResponse.json({ _id: result.insertedId, ...parsed }, { status: 201 });
    } catch (err: any) {
    console.error("POST /api/jobs failed:", err);
    return NextResponse.json(
        { error: err?.message ?? "Invalid data", code: err?.code, codeName: err?.codeName },
        { status: 400 }
    );
    }
}