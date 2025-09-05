# Job Tracker & Todo App

Job Tracker & Todo App is a fullstack application for tracking job applications and todos. Job applications can be created, edited, favorited and deleted. It also supports status changes ("Applied", "Interview", "Rejected"), and the list can be sorted and filtered by date created, status, company, favorites and ASC/DESC. The list also contains a search feature. Optimistic updates are used for deletion, giving the user a short undo window via a toast notification. A new job is created with the floating action button.
The Todo List is a lightweight checklist with add, mark as completed and delete functionality.
All data is stored in MongoDB Atlas Cloud.

How it works:
- JobList fetches jobs via /api/jobs and renders them
- Job status can be updated (Applied, Rejected, Interview, Favorite). 
- New jobs are created with the floating action button (FAB) using NewJobForm in a modal.
- TodoList renders the list of todos. 
- TodoList uses useTodos hook for CRUD. 
- TodoRow is the component for a single row in TodoList and renders text, checkbox and delete button.

The Tech Stack used for this project is the following.
- Frontend: Next.js, React, TypeScript, TailwindCSS
- Backend: Node.js, Next.js (API routes)
- Database: MongoDB Cloud
- Other: Sonner (toast notis), Vercel (Deployment)

File structure:
src/
 ├── app/               # Next.js app router
 │   ├── api/           # API routes (jobs, todos)
 │   ├── page.tsx       # Main view
 │
 ├── components/
 │   ├── task/          # Job-related UI (JobList, JobRow, etc.)
 │   ├── todo/          # Todo-related UI (TodoList, TodoRow, etc.)
 │
 ├── lib/
 │   ├── hooks/         # Custom React hooks (useTodos, useJobs)
 │   ├── db/            # MongoDB connection helper
 │   ├── types.ts       # TypeScript typer
 │
 public/                # Static assets

Planned features to make the app more useful and better visually:
- User specific jobs and todos
- Add a weekly/monthly calendar where todos can be saved
- Add small animations for deletion
