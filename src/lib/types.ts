export type JobStatus = 'applied' | 'interview' | 'rejected';
export type SortKey = "status" | "company" | "createdAt" | "favorite";
export type SortDir = "asc" | "desc";

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
  status: "applied" | "interview" | "rejected";
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

