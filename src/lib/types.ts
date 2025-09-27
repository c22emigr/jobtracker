import type { ObjectId } from "mongodb";
import type { JobStatus } from "./schemas";

export type SortKey = "status" | "company" | "createdAt" | "favorite";
export type SortDir = "asc" | "desc";
export type Id = ObjectId;
export type IdStr = string; // MongoDB ObjectId as string

export interface JobApplication {
  _id: string;            // from MongoDB
  role: string;
  company: string;
  location?: string;
  note?: string;
  status: JobStatus;       // default 'applied'
  createdAt: Date;       // ISO
  updatedAt: Date;       // ISO
}

export type Job = {
  _id: string;
  role: string;
  company: string;
  location?: string;
  note?: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  favorite: boolean;
  userId: string; // ID of the user who applied for job
};

export interface TodoItem {
  _id: string;            // from MongoDB
  text: string;
  dateISO: string | null;         // yyyy-mm-dd for daily schedule
  done: boolean;
  priority?: "low" | "medium" | "high";
  type?: "job" | "personal" | "project"; 
  createdAt: Date;
  updatedAt: Date;
  userId: string; // ID of the user who created the todo
}

export interface UserDb {
  _id: Id;
  email: string;
  emailNorm: string; // normalized email (lowercase)
  username?: string;
  usernameNorm?: string; // normalized username (lowercase)
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialsDb {
  _id: Id;
  userId: Id;
  kind: "password";
  passwordHash: string;
  algo: "argon2id";
  createdAt: Date;
  updatedAt: Date;
}

export type UserDTO = Omit<UserDb, "_id" | "createdAt" | "updatedAt" | "emailNorm" | "usernameNorm"> & { 
  _id: IdStr; 
  createdAt: string;
  updatedAt: string;
};