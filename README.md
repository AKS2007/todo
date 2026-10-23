# Daymark To-Do

A calm, responsive task planner built with React, Vite, Express, and MongoDB. It is beginner friendly: run it locally with no database setup, then switch to MongoDB by adding one environment variable.

## Features

- Create, edit, complete, and delete tasks
- Set priorities and optional due dates
- Search tasks and filter by all, in progress, or completed
- Track daily completion progress
- Responsive desktop and mobile layouts with light and dark appearances
- MongoDB persistence or a local JSON fallback

## Run locally

You need Node.js 18 or newer.

1. Install dependencies: npm install
2. Start the API and frontend: npm run dev
3. Open the Vite address shown in the terminal (usually http://localhost:5173).

The API runs on port 4000. Without a .env file, tasks are stored in tasks.json at the project root. To use MongoDB, copy .env.example to .env, set MONGODB_URI to your local or Atlas connection string, and set MONGODB_DB if you want a different database name.

## Production build

Run npm run build to create dist/. Set production environment variables, then run npm start. Express serves both the built frontend and API.

## Project files

- main.jsx — React app and task interactions
- style.css — responsive visual design
- index.js — Express API and persistence
- index.html — Vite app entry point
- vite.config.js — local API proxy
- .env.example — optional MongoDB configuration

## API

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /api/tasks | List tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Edit a task or completion state |
| DELETE | /api/tasks/:id | Delete a task |

## Notes

The app starts with an empty task list. If the API is unavailable, the browser shows a small sample preview so the interface remains explorable. MongoDB is optional for local development; the JSON store is intended for a single local user, while MongoDB is a better choice for a deployed multi-user service.
