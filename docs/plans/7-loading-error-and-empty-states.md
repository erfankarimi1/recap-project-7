# Plan for issue #7: Loading, Error and Empty States

Branch: `feature/7-loading-error-and-empty-states`
Plan file: `docs/plans/7-loading-error-and-empty-states.md`

Frontend only. The backend and the API contract do not change. The app today shows "Loading..." and an empty-list message, but a failed request is not handled: a failed load shows a blank page, a failed add, edit, delete or tick is an unhandled error and the user sees nothing.

## 1. Summary
The app tells the user what is going on. A failed load replaces the list with an error message and a "Try again" button. A failed add, edit, delete or tick shows the message of the API (or "Could not reach the server" when the backend is down) and the list stays as it was. After a failed save the typed text is still there. The empty list gets a friendly hint, and "Add" is disabled while its request runs, so a double click creates only one todo.

## 2. Acceptance criteria to checks
No new tests (your decision) and no Playwright unless you ask. Each criterion is covered by the code, and checked by hand with the tasks from the issue.

| # | Criterion | How it is covered | How to check |
|---|---|---|---|
| 1 | A loading message while the list loads | already there: `isLoading` shows "Loading..."; it stays and is not shown together with an error | reload the page with a slow or stopped backend |
| 2 | Backend not reachable: error message and "Try again" replace the list; nothing crashes; after the backend is back, "Try again" shows the todos | `error` from `useSWR`; the page shows the message and a "Try again" button (calls `mutate()`) instead of the form list | stop the backend, reload, start it again, press "Try again" |
| 3 | An API error for add, edit, delete (and tick) shows its message; the list stays | `api.ts` reads `{ "error": "..." }` from the response (a helper used by all functions); `App.tsx` catches the error in each handler and shows it in a `role="alert"` message above the list; `mutate()` is not called on failure, so the list is untouched | add with the backend stopped: "Could not reach the server"; send a bad request (API 400 message) |
| 4 | After a failed save the typed text is still there | fields are cleared only after the request succeeded; the edit field stays open on failure | add and edit with the backend stopped: text is still in the field |
| 5 | An empty list shows a friendly message with a hint to add the first todo | keep "No todos yet 🙂" and add a second line "Add your first todo with the form above." | delete all todos (or use a fresh database) |
| 6 | "Add" is disabled while the request runs | `isSaving` state: set before the request, reset in `finally`; the button is `disabled` when the title is blank or `isSaving` | double click "Add": one todo |
| 7 | Nothing else broke | `npm run check`, `npm run build`, `npm test` (existing tests) in `frontend/`; `npm run typecheck` in `backend/` | all pass |

## 3. Files that change
- `frontend/src/api.ts` (modified): one small helper that builds the error message (the `error` field of the API response, or "Could not reach the server" when `fetch` itself fails); used by `fetchTodos`, `createTodo`, `updateTodo` and `deleteTodo`. No `fetch` outside this file.
- `frontend/src/App.tsx` (modified): `error` from `useSWR` with the error box and "Try again"; an `actionError` state with a `role="alert"` message; `try/catch` in `handleSubmit`, `handleToggle`, `handleDelete` and `handleSave`; `isSaving` for "Add"; the empty-state hint. The error box and the list are never shown together, and "No todos yet" is not shown when there is an error.
- `frontend/src/styles.css` (modified): style for the error box and the "Try again" button, with the existing CSS variables (`--error`), for light and dark mode.
- `docs/plans/7-loading-error-and-empty-states.md` (new): this plan, committed alone.

No new dependencies, no backend changes, no changes to existing tests (the empty message "No todos yet 🙂" stays exactly as it is; the hint is a separate line).

## 4. Out of scope
- Backend files and `docs/api-contract.md`.
- Loading spinners or skeletons, toast messages, automatic retries (SWR's default retry is left as it is), offline mode.
- Disabling the "Save", "Delete" and checkbox while their requests run (only "Add" is required).
- Filtering (issue 9), authentication, CORS, `.env`.
- New tests, Playwright checks (only when you ask).

## 5. Open questions
1. **Branch base.** `feature/6-delete-a-todo` is pushed but has no PR yet, and issue 4, 5 and 6 work is in it. Issue 7 builds on it. I recommend branching `feature/7-loading-error-and-empty-states` from `feature/6-delete-a-todo`, as the earlier branches were stacked. Or open the PR for 6 first and wait for the merge?
2. **Error texts.** For a failed load: "Could not load the todos." plus the reason. For a stopped backend: "Could not reach the server. Is the backend running?". For API errors: the API message as it is. Fine, or other wording?
3. **One message place.** One shared error message above the list for add, edit, delete and tick, replaced by the next one and cleared after the next success. Or a message at each row? I recommend one shared message (simpler).
4. **Scope of `isSaving`.** Only "Add" as the issue says. Should "Save" in the edit form get the same protection?

## Verification
- `cd frontend && npm run check`, `npm run build`, `npm test`; `cd backend && npm run typecheck`.
- By hand (or with Playwright only if you ask), the two tasks of the issue: stop the backend, reload, start it, press "Try again"; type a todo, stop the backend, press "Add" (error message, text still there); start the backend and press "Add" again; double click "Add" (one todo).
- Search `frontend/src` for `fetch(`: only `api.ts` calls it.
