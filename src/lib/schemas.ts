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

const Tag = z.string().min(1).max(30).trim();

const LettersAndSpaces = /^[\p{L}\s]+$/u;

// ---------- Job ----------
export const JobApplicationSchema = z.object({
  role: z.string().min(2),
  company: z.string().min(2),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .regex(LettersAndSpaces, "Letters and spaces only")
    .optional(),
  note: z.string().max(250, "Max 250 characters").optional(),
  status: JobStatusSchema.default("applied"),
  favorite: z.boolean().default(false),
  tags: z.array(Tag).default([]),
  createdAt: isoDate.default(() => new Date().toISOString()),
  updatedAt: isoDate.default(() => new Date().toISOString()),
});

// ---------- Job Update ----------
export const JobUpdateSchema = z
  .object({
    role: z.string().min(2).optional(),
    company: z.string().min(2).optional(),
    location: z
      .string()
      .trim()
      .min(2, "Location must be at least 2 characters")
      .regex(LettersAndSpaces, "Letters and spaces only")
      .optional(),
    note: z.string().max(250, "Max 250 characters").optional(),
    status: JobStatusSchema.optional(),
    favorite: z.boolean().optional(),
    tags: z.array(Tag).optional(),
  })
  .strict()
  .refine(obj => Object.keys(obj).length > 0, { message: "No fields to update" });


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
export type JobUpdate = z.infer<typeof JobUpdateSchema>;
export type TodoCreate = z.infer<typeof TodoCreateSchema>;
export type TodoDoc = z.infer<typeof TodoDocSchema>;
