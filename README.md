# Daymark To-Do

A calm, responsive task planner built with React, Vite, Express, and MongoDB. It is designed to be beginner friendly: run it locally with no database setup, then switch to MongoDB by adding one environment variable.

## What it can do

- Create, edit, complete, and delete tasks
- Set a priority and optional due date
- Search tasks and filter by all, in progress, or completed
- Track your daily completion progress
- Use on mobile or desktop, with light and dark appearances
- Store tasks in MongoDB or a local JSON file

## Run it locally

You need Node.js 18 or newer.

1. Install packages: `npm install`
2. Start the app: `npm run dev`
3. Open the Vite address shown in the terminal (usually `http://localhost:5173`).

The API runs on port 4000. With no `.env` file, tasks are stored in `server/tasks.json` and created automatically. To use MongoDB, copy `.env.example` to `.env`, set `MONGODB_URI` to your local or Atlas connection string, and set `MONGODB_DB` if you want a different database name.

## Production build

Run `npm run build` to create the frontend in `dist/`. Set the production environment variables, then run `npm start`. Express serves both the built frontend and API.

## Project map

```text
src/main.jsx       React app and task interactions
src/style.css      Responsive visual design
server/index.js    Express API and persistence
vite.config.js     Local API proxy
.env.example       Optional MongoDB configuration
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Edit a task or completion state |
| DELETE | `/api/tasks/:id` | Delete a task |

## Notes

The app starts with an empty task list. If the API is unavailable, the browser shows a small read-only sample preview so the interface remains explorable. MongoDB is optional for local development; the JSON store is intended for a single local user, while MongoDB is the better choice for a deployed multi-user service.
