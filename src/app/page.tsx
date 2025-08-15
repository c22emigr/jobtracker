import NewJobForm from "@/components/task/NewJobForm";

export default function Page() {
  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Job Tracker</h1>
      <NewJobForm />
    </main>
  );
}
