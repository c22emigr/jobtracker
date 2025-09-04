Job Tracker & Todo App is a fullstack application that allows the user to track their job applications, including features like changing the status of your job application; "Applied", "Interview", "Rejected". The list of jobs is also sortable by date created, status, company, favorites and ASC/DESC. The list is also filterable by the job status and it also contains a search feature. Each job application in the list is editable, favoritable and deletable and you're able to change the status of the job. Optimistic delete is used to add a short window to allow for undoing the delete in the toast. A new job is created with the floating action button.
The Todo List is a simple list allowing the user to write down important notes which can then be checked off and deleted.
All data is stored in MongoDB Atlas Cloud.

How it works:
JobList gets jobs through /api/jobs to display and then the user is able to update jobstatus (Applied, Rejected, Interview, Favorite). New jobs are created with the FAB and uses NewJobForm which then opens a modal.

TodoList renders the list of todos. CRUD happens in useTodos hook. TodoRow is the component for a single row in TodoList and renders text, checkbox and delete button.

The Tech Stack used for this project is the following.
Frontend: Next.js, React, TypeScript, TailwindCSS
Backend: Node.js, Next.js (API routes)
Database: MongoDB Cloud
Other: Sonner (toast notis), Vercel (Deployment)

File structure:

Planned features:
- User specific jobs and todos
- Add a weekly/monthly calendar where todos can be saved
- Add small animations for deletion
