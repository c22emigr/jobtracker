export type JobStatus = 'applied' | 'interview' | 'rejected';

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

export interface TodoItem {
  _id?: string;            // from MongoDB
  text: string;
  dateISO: string;         // yyyy-mm-dd for daily schedule
  done: boolean;
  createdAt: string;
  updatedAt: string;
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
