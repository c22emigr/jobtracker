import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { JobApplicationSchema } from "@/lib/schemas";
import type { JobApplication } from "@/lib/types.ts";
import { z } from "zod";
import { requireAuth, toJsonError } from "@/lib/auth";

// GET: fetch all jobs
export async function GET(req: Request) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated
    const col = await getCollection<JobApplication>("jobs");
    const jobs = await col.find({ userId }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({ ok: true, data: jobs });
  } catch (e) {
    return toJsonError(e);
  }
}

// POST: add new job
export async function POST(req: Request) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated
    const body = await req.json();
    const parsed = JobApplicationSchema.safeParse({
      ...body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

      const col = await getCollection<z.infer<typeof JobApplicationSchema>>("jobs");
      const { insertedId } = await col.insertOne(parsed.data);
      return NextResponse.json(
        { ok: true, data: { _id: insertedId, ...parsed.data } },
        { status: 201 });
    } catch (e) {
    return toJsonError(e);
    }
}