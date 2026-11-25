# Plan for issue #6: Delete a Todo (+ due time, priority, progress page)

Branch: `feature/6-delete-a-todo`
Plan file: `docs/plans/6-delete-a-todo.md`

Issue #6 on GitHub is only "Delete a Todo". You asked for three more things on top of it: a time for every todo, a priority tag, and a new page with the progress of each priority and a weekly result. The extras are not in the issue, and they change the API contract. The plan therefore has two parts: **Part A** is the issue itself, **Part B** is your extra scope. Part A is small and works alone.

## 1. Summary
**Part A (the issue):** every todo gets a "Delete" button. A click sends `DELETE /api/todos/:id`, then SWR loads the list again and the todo is gone, also after a reload. The API route already exists and answers 204 / 404 (checked earlier).
**Part B (your extras):** each todo gets an optional due time (`dueAt`) and a priority (`low`, `medium`, `high`, default `medium`), both chosen in the add form and shown in the list. A second page shows, for each priority, how many todos are done out of how many, and a weekly result for the current week (Monday to Sunday): done out of total todos that are due on each day. The numbers are computed in the frontend from `GET /api/todos`, so there is no new endpoint.

## 2. Acceptance criteria to checks
No new tests (your decision) and no Playwright unless you ask, so each criterion is covered by the code and by the checks in the last column.

| # | Criterion | How it is covered | What it shows |
|---|---|---|---|
| A1 | API: `DELETE` answers 204 without body and removes the todo | route exists in `backend/src/routes/todos.ts`, checked earlier with curl | 204, then the todo is gone from `GET` |
| A2 | API: unknown or invalid id answers 404, a second delete gives 404 | same route, checked earlier with curl | `{ "error": "Todo not found" }` |
| A3 | UI: every todo has a "Delete" button; the todo is gone after the click | `deleteTodo(id)` in `api.ts` (no `response.json()` on the 204), `handleDelete` in `App.tsx` calls it, then `mutate()` | manual: click "Delete", the row disappears |
| A4 | Still gone after a reload and in the database | the list comes from the API | manual: reload; `curl http://localhost:3001/api/todos` |
| B1 | A todo has an optional due time | `dueAt` in the schema, `Todo` type and form (`datetime-local` input), shown in the row | manual: add a todo with a time, reload, it is still there |
| B2 | A todo has a priority tag | `priority` enum in the schema, `Todo` type, a select in the form, a tag in the row | manual: add with "high", the tag shows; an invalid value gets 400 from the API |
| B3 | Old todos still work | schema defaults (`priority: "medium"`, `dueAt: null`) | the three existing todos load without errors |
| B4 | Progress page: done / total per priority | new `Progress.tsx`, numbers computed from the todo list | manual: counts match the list |
| B5 | Weekly result for the current week | same page: Monday to Sunday, done / total per day by `dueAt` | manual: a todo due on a day of this week is counted on that day |
| B6 | Nothing else broke | `npm run check`, `npm run build`, `npm test` (existing tests) in `frontend/`, `npm run typecheck` in `backend/` | all pass |

## 3. Files that change
**Part A**
- `frontend/src/api.ts` (modified): add `deleteTodo(id)`, `DELETE`, throws when not ok, does not read a body.
- `frontend/src/App.tsx` (modified): "Delete" button on each row and `handleDelete`.
- `frontend/src/styles.css` (modified): style for the "Delete" button (danger colour for light and dark mode).

**Part B**
- `backend/src/models/Todo.ts` (modified): add `priority` (enum, default `medium`) and `dueAt` (Date, default `null`); `toTodo` returns them (`dueAt` as ISO string or `null`).
- `backend/src/types.ts` (modified): `Todo` and `NewTodo` get `priority` and `dueAt`.
- `backend/src/middleware/errors.ts` (modified): a `CastError` for the `_id` stays 404, but a cast error for another field (for example a bad `dueAt` on `PUT`) must be 400, not 404. The 400 message also names `priority` and `dueAt`.
- `docs/api-contract.md` (modified): the contract changes in the same step: five fields, the new rules and examples, `PUT` always sends all fields.
- `frontend/src/types.ts` (modified): same two fields.
- `frontend/src/api.ts` (modified): `createTodo` sends `priority` and `dueAt`; `updateTodo` already sends the whole todo, it must send the new fields too.
- `frontend/src/App.tsx` (modified): add form gets a time input and a priority select; rows show the priority tag and the time; a switch between the two pages.
- `frontend/src/Progress.tsx` (new): the progress page.
- `frontend/src/styles.css` (modified): styles for the tag, the form fields, the page and the bars.
- `docs/plans/6-delete-a-todo.md` (new): this plan, committed alone.

No new dependencies. The page switch uses a small state or `window.location.hash` instead of `react-router`.

## 4. Out of scope
- Edit of the priority or time of an existing todo (issue 5 edits the title only).
- A new backend endpoint for statistics, a `completedAt` field, history of past weeks, charts libraries.
- Loading, error and empty states (issue 7), filtering (issue 9), authentication, CORS, `.env`.
- New tests, Playwright checks (only when you ask).

## 5. Open questions
1. **Scope and issues.** `CLAUDE.md` says "only do what the current issue asks for". Part B is large and changes the API. Should I (a) do it all on `feature/6-delete-a-todo` as planned, in separate commits (Part A first), or (b) do only Part A on this branch and plan Part B as its own issue and branch? I recommend (b) for a clean PR, but (a) if you want it in one go.
2. **What "weekly result" means.** I plan: the current week, Monday to Sunday, done and total todos by their due time. Todos without a time are not counted in the week. The alternative is "todos finished this week", which needs a new `completedAt` field set by the API. Which one?
3. **Priority values.** `low`, `medium`, `high` with `medium` as default. Fine, or other names or more levels?
4. **Page switch.** Two buttons in the header ("Todos" and "Progress") that switch the page, with no router dependency and no URL change. Or a real URL like `/progress`, which needs `react-router` (a new dependency, needs your OK). I recommend the buttons.
5. **Branch base.** `feature/5-edit-a-todo` still has all the issue #4 and #5 changes uncommitted and no PR yet. This plan commit would sit on top of that branch. I recommend committing and opening the PR for #5 first, then branching from it.

## Verification
- `cd frontend && npm run check`, `npm run build`, `npm test`; `cd backend && npm run typecheck`.
- Part A: delete a todo in the app, reload, `curl http://localhost:3001/api/todos`; send `DELETE` twice with curl (204, then 404) and with `abc` (404).
- Part B (curl): `POST` with `priority: "urgent"` gives 400; `PUT` with `dueAt: "not a date"` gives 400 (not 404); old todos come back with `priority: "medium"` and `dueAt: null`.
- Part B (browser, manual or Playwright only if you ask): add todos with different priorities and times, open the progress page, compare the numbers with the list.
- Search `frontend/src` for `fetch(`: only `api.ts` calls it.
