# CRUDZASO

Web app for managing academic tasks with **user** and **admin** roles, using JSON Server as a fake API.

## Requirements

- Node.js (for JSON Server)
- Modern browser

## How to run

1. **Install dependencies** (first time only):
   ```bash
   npm install
   ```

2. **Start the fake API** (port 3000):
   ```bash
   npm run server
   ```
   Keep this running in a terminal.

3. **Open the app**  
   Open in your browser the file `index.html` or `html/login.html` (double-click or "Open with" your browser).  
   If you use Live Server or another local server, open the project folder and go to `index.html` or `html/login.html`.

## Test accounts

| Role   | Email                 | Password |
|--------|------------------------|----------|
| Admin  | admin@crudtask.com     | admin123 |
| User   | user@crudtask.com      | user123  |

- **User**: register, login, my tasks (CRUD), change status (pending / in progress / completed), profile, log out.
- **Admin**: login, dashboard (metrics: total, pending, in progress, completed), view/edit/delete all tasks, log out.

## Structure

- `html/` – Login, register, user dashboard, my tasks, profile.
- `admin/` – Admin dashboard and all-tasks management.
- `js/` – config, API, auth, and page scripts (no inline scripts in HTML).
- `css/` – Styles.
- `db.json` – API data (users and tasks).

## Security rules

- No session → redirect to login.
- User (`user`) only accesses user views; if they try to open `/admin/` they are redirected to the user dashboard.
- Admin only uses admin views; does not use user views.

## Tech stack

- HTML5, CSS3, Bootstrap 5, vanilla JavaScript, JSON Server, localStorage (session).
