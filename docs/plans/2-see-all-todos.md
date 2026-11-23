# Plan for issue #2: See All Todos

Branch: `feature/2-see-all-todos`

## 1. Summary
The todos should come from MongoDB, through `GET /api/todos`, into the React app. The backend gets the schema, the model and `toTodo`, plus the GET route. The frontend gets an SWR fetcher in `api.ts` and a list with loading and empty messages. Done todos are shown with a checked checkbox and a struck-through title.

## 2. Acceptance criteria to tests

| # | Criterion | Test | Asserts |
|---|---|---|---|
| 1 | Model with `toTodo` | `backend/src/models/Todo.test.ts` > "toTodo sends id, no _id, no __v" | the result has exactly `id`, `title`, `done` |
| 2 | `GET /api/todos` returns 200 with a list | `backend/src/routes/todos.test.ts` > "GET /api/todos returns all todos" | status 200 and each item has exactly `id`, `title`, `done` |
| 3 | Done todo shown as done | `frontend/src/App.test.tsx` > "shows a done todo checked and struck through" | the checkbox is checked and the title has the `done` class |
| 4 | Fetcher in `api.ts`, `useSWR`, no `fetch` in components | `npm run check` and a search for `fetch` in `App.tsx` | only `api.ts` calls `fetch` |
| 5 | Loading message | `frontend/src/App.test.tsx` > "shows a loading message" | "Loading..." is visible before the data arrives |
| 6 | Empty message | `frontend/src/App.test.tsx` > "shows a friendly message when there are no todos" | the message is visible for `[]` |

## 3. Files that change
- `backend/src/models/Todo.ts` (modified): the schema (`title` required and trimmed, `done` default `false`), the model and `toTodo`.
- `backend/src/routes/todos.ts` (modified): only `GET /`, using `Todo.find()` and `docs.map(toTodo)`.
- `frontend/src/api.ts` (modified): `fetchTodos()` used as the SWR fetcher.
- `frontend/src/App.tsx` (modified): `useSWR`, the loading message, the empty message and the list. It reuses the existing CSS classes.
- Test files (new): `backend/src/models/Todo.test.ts`, `backend/src/routes/todos.test.ts`, `frontend/src/App.test.tsx`.
- Test setup (modified): `vitest` in `backend/` and `frontend/`, plus `@testing-library/react` and `jsdom` in `frontend/`, with a `test` script in both `package.json` files. Approved by the user for this plan.
- `CLAUDE.md` (modified): add the test commands, and allow tests for the stories from now on.
- `docs/api-contract.md`: unchanged.

## 4. Out of scope
POST, PUT and DELETE, the add, toggle, edit and delete UI, the error state (issue 7), filtering (issue 9), authentication, dependencies other than the test setup above, and any change to CORS or `.env`.

## 5. Decisions (approved)
1. Tests: the test setup above is approved.
2. The checkbox is read-only until issue 4, with an accessible label.
3. A failed fetch shows nothing extra until issue 7.
4. The order is the database's natural order.
