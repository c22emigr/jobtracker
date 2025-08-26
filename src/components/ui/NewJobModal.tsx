"use client";

import Modal from "@/components/ui/Modal";
import NewJobForm from "@/components/task/NewJobForm";
import type { Job } from "@/lib/types";

export default function NewJobModal({
  open,
  onClose,
  setJobs,
}: {
  open: boolean;
  onClose: () => void;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Add Job">
      <NewJobForm
        onJobCreated={(job: Job) => {
          // insert at top (or however you prefer)
          setJobs(prev => [job, ...prev]);
          onClose();
        }}
      />
    </Modal>
  );
}