import { NextResponse } from "next/server";
import { requireAuth, toJsonError } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { z } from "zod";

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

const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

const TodoUpdateSchema = z.object({
  text: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
}).refine(obj => Object.keys(obj).length>0, { message: "No fields to update" });

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated

    const _id = oid(params.id);
    if (!_id) {
      return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = TodoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const col = await getCollection<TodoDb>("todos");
    const doc = await col.findOneAndUpdate(
      { _id, userId },      // Ensure user can only update their own todos
      { $set: { ...parsed.data, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!doc) {
      return NextResponse.json(
        { ok: false, error: "Not found" }, 
        { status: 404 }
      );
    }
    return NextResponse.json(
      { ok: true, data: { ...doc, _id: doc._id!.toString() },
    });
  } catch (e) {
    return toJsonError(e);
  }
}


export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await requireAuth(); // Ensure user is authenticated

    const _id = oid(params.id);
    if (!_id) {
      return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
      );
    }

    const col = await getCollection<TodoDb>("todos");
    const doc = await col.findOneAndDelete({ _id, userId }); // Ensure user can only delete their own todos

    if (!doc) {
      return NextResponse.json(
        { ok: false, error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {  ok: true, data: { _id: doc._id.toString() } }
    );
  } catch (e) {
    return toJsonError(e);
  }
}