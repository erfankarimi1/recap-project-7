# Todo App

A full-stack todo app with React, Express and MongoDB. You can add, tick off, edit and delete todos, show only the open or only the done ones, give each todo a priority and an optional time, and look at a progress page (done todos per priority and a result for the current week).

- `backend/`: Express 5 API with MongoDB (mongoose), TypeScript, run with `tsx`
- `frontend/`: React 19 app with Vite, TypeScript and SWR, plain CSS (light and dark mode)
- `docs/api-contract.md`: the API contract (paths, status codes, fields, errors)

## Requirements

- Node.js 22
- A MongoDB database: either a local MongoDB (`mongodb://127.0.0.1:27017/todos`) or a free MongoDB Atlas cluster

## Run it

Start from a fresh clone. You need two terminals, one for the backend and one for the frontend.

**1. Backend** (terminal 1)

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your values (it is ignored by git, never commit it):

| Variable      | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| `MONGODB_URI` | Connection string of your database, for example `mongodb://127.0.0.1:27017/todos` for a local MongoDB, or your Atlas string |
| `PORT`        | Port of the API, `3001` by default                                              |

Then start the API:

```bash
npm run dev
```

You should see `Connected to MongoDB database "todos"` and `API running on http://localhost:3001`.

**2. Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

**3. Open it**

- The app: http://localhost:5173
- The API health check: http://localhost:3001/api/health (answers `{ "status": "ok" }`)
- The todos as JSON: http://localhost:3001/api/todos

The frontend talks to `http://localhost:3001/api` (set in `frontend/src/api.ts`). The backend only accepts requests from `http://localhost:5173` (CORS, set in `backend/src/app.ts`).

## Checks

| Where       | Command             | What it does                      |
| ----------- | ------------------- | --------------------------------- |
| `backend/`  | `npm run typecheck` | checks the types                  |
| `frontend/` | `npm run check`     | checks the types                  |
| `frontend/` | `npm run build`     | checks the types and builds the app |
| `frontend/` | `npm test`          | runs the existing tests           |

## How it is organised

- `backend/src/app.ts` builds the app (CORS, JSON, routes, error handlers), `index.ts` connects to the database and listens.
- `backend/src/routes/todos.ts` has the routes, `models/Todo.ts` the schema and `toTodo`, `middleware/errors.ts` the 404 and error handlers.
- `frontend/src/api.ts` holds **all** calls to the API. Components never call `fetch`.
- `frontend/src/App.tsx` is the todo list, `Progress.tsx` the progress page.

## Where an owner would go

To give every todo an owner (a user who owns it), the backend gets an `owner` field in the todo schema (`models/Todo.ts`, a reference to a new user model) and in the types. `routes/todos.ts` would set it from the logged-in user when a todo is created, and would only find, update and delete todos with that owner. In the frontend, `api.ts` is the single place that sends the login token with every request, and `App.tsx` would get a login form and show only the todos of the logged-in user. The contract in `docs/api-contract.md` would change in the same step.
