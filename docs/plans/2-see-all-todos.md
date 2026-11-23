# Plan for issue #2: See All Todos (UI part only)

Branch: `feature/2-see-all-todos`

The backend part (model, `toTodo`, `GET /api/todos`) is written by the user, not in this plan.

## 1. Summary
The todos should come from the API into the React app. The frontend gets an SWR fetcher in `api.ts` and a list in `App.tsx` with a loading message and an empty-state message. Done todos are shown with a checked checkbox and a struck-through title.

## 2. Acceptance criteria to tests (UI criteria only)

| # | Criterion | Test | Asserts |
|---|---|---|---|
| 1 | Done todo shown as done | `frontend/src/App.test.tsx` > "shows a done todo checked and struck through" | the checkbox is checked and the title has the `done` class; an open todo is not |
| 2 | Fetcher in `api.ts`, `useSWR`, no `fetch` in components | `npm run check` and a search for `fetch(` in `src` | only `api.ts` calls `fetch`; `App.tsx` uses `useSWR` |
| 3 | Loading message | `frontend/src/App.test.tsx` > "shows a loading message" | "Loading..." is visible while the request is pending |
| 4 | Empty message | `frontend/src/App.test.tsx` > "shows a friendly message when there are no todos" | "No todos yet." is visible for `[]` |

The tests mock `fetchTodos` from `./api`, so they need no backend and no network.

## 3. Files that change
- `frontend/src/api.ts` (modified): `fetchTodos(): Promise<Todo[]>` used as the SWR fetcher; it throws when the response is not ok.
- `frontend/src/App.tsx` (modified): `useSWR`, the loading message, the empty message and the list (existing CSS classes `todo-list`, `todo-item`, `todo-title`, `done`). The checkbox is read-only with an accessible label (the title).
- `frontend/src/App.test.tsx` (new): the three UI tests above.
- `frontend/vite.config.ts` (modified): add the vitest `test` block (jsdom, globals).
- `frontend/package.json` and `frontend/package-lock.json` (modified): dev dependencies `vitest@^3` (the newest vitest needs Vite 6, the project uses Vite 5), `@testing-library/react`, `@testing-library/dom` (peer dependency of the first), `jsdom`, and a `test` script. Approved by the user.
- `CLAUDE.md` (modified): add `npm test` to the frontend commands and allow tests for the stories.

## 4. Out of scope
- Everything in the backend: `models/Todo.ts`, `routes/todos.ts`, the backend tests and test setup. The user is doing these.
- POST, PUT and DELETE, and the add, toggle, edit and delete UI.
- The error state (issue 7), filtering (issue 9), authentication, CORS and `.env` changes.
- Any dependency other than the frontend test setup above.

## 5. Decisions (approved)
1. The frontend test setup above is approved. There is no backend test setup.
2. The checkbox is read-only until issue 4.
3. A failed fetch shows nothing extra until issue 7.
4. The order is whatever the API sends.
5. The empty message is "No todos yet." and does not mention adding, because adding comes in issue 3.

## Dependency on the backend
The UI tests use a mocked `fetchTodos`, so they pass without the backend. To see real data in the browser, `GET /api/todos` must exist in `backend/src/routes/todos.ts`. At the time of this plan, the route is not written yet.
