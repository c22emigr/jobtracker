import Image from "next/image";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: 16 }}>
      <h1>Tasks</h1>
      <p>Welcome. Go to /tasks to manage items.</p>
    </main>
  );
}
