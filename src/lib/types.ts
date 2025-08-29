export type JobStatus = 'applied' | 'interview' | 'rejected';
export type SortKey = "status" | "company" | "createdAt" | "favorite";
export type SortDir = "asc" | "desc";

export interface JobApplication {
  _id?: string;            // from MongoDB
  role: string;
  company: string;
  location?: string;
  note?: string;
  status: JobStatus;       // default 'applied'
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
}

export type Job = {
  _id: string;
  role: string;
  company: string;
  location?: string;
  note?: string;
  status: "applied" | "interview" | "rejected";
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
};

export interface TodoItem {
  _id: string;            // from MongoDB
  text: string;
  dateISO: string | null;         // yyyy-mm-dd for daily schedule
  done: boolean;
  priority?: "low" | "medium" | "high";
  type?: "job" | "personal" | "project"; 
  createdAt: string;
  updatedAt: string;
}

