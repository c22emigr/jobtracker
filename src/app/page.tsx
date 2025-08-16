"use client";
import { useState } from "react";
import NewJobForm from "@/components/task/NewJobForm";
import JobList from "@/components/task/JobList";

export default function Page() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <div>
        <NewJobForm />
      </div>
      <div>
        <JobList />
      </div>
    </div>
  );
}
