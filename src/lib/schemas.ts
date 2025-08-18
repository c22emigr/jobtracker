import { z } from "zod";

// ---------- Reusable ----------
export const JobStatusSchema = z.union([
  z.literal("applied"),
  z.literal("interview"),
  z.literal("rejected"),
]);

const isoDate = z
  .preprocess(v => (v instanceof Date ? v.toISOString() : v), z.string())
  .refine(v => !Number.isNaN(Date.parse(v)), "Invalid ISO date");

// ---------- Job ----------
export const JobApplicationSchema = z.object({
  role: z.string().min(2),
  company: z.string().min(2),
  location: z.string().optional(),
  note: z.string().optional(),
  status: JobStatusSchema.default("applied"),
  createdAt: isoDate.default(() => new Date().toISOString()),
  updatedAt: isoDate.default(() => new Date().toISOString()),
});

// ---------- Todo ----------
export const TodoCreateSchema = z.object({
  text: z.string().min(1).max(200).trim(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-mm-dd"),
});

export const TodoDocSchema = TodoCreateSchema.extend({
  _id: z.any().optional(),
  done: z.boolean().default(false),
  createdAt: isoDate.default(() => new Date().toISOString()),
  updatedAt: isoDate.default(() => new Date().toISOString()),
});

// ---------- Types ----------
export type JobStatus = z.infer<typeof JobStatusSchema>;
export type JobApplication = z.infer<typeof JobApplicationSchema>;
export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoDoc = z.infer<typeof TodoDocSchema>;
