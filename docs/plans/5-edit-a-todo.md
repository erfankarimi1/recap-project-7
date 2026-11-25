# Plan for issue #5: Edit a Todo

Branch: `feature/5-edit-a-todo`
Plan file: `docs/plans/5-edit-a-todo.md`

The issue is UI only. The backend needs no change: `PUT /api/todos/:id` already works (200 with the new values, 404 for an unknown or invalid id, 400 for an empty title) and `updateTodo` already exists in `frontend/src/api.ts`.

## 1. Summary
Every todo gets an "Edit" button. A click turns its title into a text field with "Save" and "Cancel" buttons. "Save" sends the new title together with the unchanged `done` through the existing `updateTodo`, then SWR loads the list again, so the todo shows the new title. "Cancel" closes the field and keeps the old title. An empty title is never sent.

## 2. Acceptance criteria to checks
The project has no new tests (decision of the user) and no automatic browser checks (Playwright only when asked), so each criterion is covered by the code and by the checks below. A manual check in the browser is for the user, or for me when asked.

| # | Criterion | How it is covered | What it shows |
|---|---|---|---|
| 1 | Every todo has an "Edit" button that turns the title into a text field with "Save" and "Cancel" | `App.tsx`: `editingId` state; the row renders the field and the two buttons for the todo being edited | manual: click "Edit", see the field (filled with the current title), "Save" and "Cancel" |
| 2 | "Save" sends the new title and keeps `done`; the todo shows the new title | `handleSave` calls `updateTodo({ ...todo, title: newTitle })`, then `mutate()` | manual: change a title, Save, list shows it; `done` is unchanged (also for a done todo) |
| 3 | "Cancel" closes the field and keeps the old title | `handleCancel` sets `editingId` to `null`, nothing is sent | manual: type something, Cancel, old title is back, no request |
| 4 | An empty title is not sent | "Save" is disabled while `editTitle.trim() === ""` (same rule as the "Add" button) | manual: clear the field, "Save" is disabled |
| 5 | The new title is still there after a reload | the title comes from the API (`GET /api/todos`) | manual: reload the page; `curl http://localhost:3001/api/todos` shows the same title |
| 6 | Nothing else broke | `npm run check`, `npm run build`, `npm test` (existing tests only), `npm run typecheck` in `backend/` | all pass; the existing tests still pass |

## 3. Files that change
- `frontend/src/App.tsx` (modified): state for the todo being edited (`editingId`, `editTitle`), "Edit" button on each row, and in edit mode a form with a text field (labelled for screen readers), "Save" (disabled for an empty or blank title) and "Cancel". `handleSave` uses the existing `updateTodo` and `mutate()`. The checkbox keeps working as in issue 4.
- `frontend/src/styles.css` (modified): small styles for the "Edit", "Save" and "Cancel" buttons and the edit field, using the existing CSS variables so light and dark mode both work.
- `docs/plans/5-edit-a-todo.md` (new): this plan, committed alone.

No new dependencies, no backend changes, no changes to `api.ts` (the function already exists).

## 4. Out of scope
- All backend files and `api.ts` (route and `updateTodo` already exist).
- Delete (issue 6), loading, error and empty states (issue 7), filtering (issue 9).
- An error message when saving fails (issue 7). A failed request leaves the list as it is.
- Optimistic updates, keyboard shortcuts such as Escape to cancel, editing more than one todo at the same time.
- New tests, authentication, CORS, `.env`, new dependencies.

## 5. Open questions
1. **Branch base.** `feature/4-mark-a-todo-as-done` has uncommitted changes (issue 4 code, the `SubmitEvent` fix, the test text fix, a comment change in `backend/src/routes/todos.ts`) and its PR is not open yet. Issue 5 builds on the issue 4 code in `App.tsx`. Should I first commit and open the PR for issue 4 (the `/open-pr` that was interrupted), then branch `feature/5-edit-a-todo` from `feature/4-mark-a-todo-as-done`? I recommend that, so the plan commit stays alone and the working tree is clean.
2. **Where the row code lives.** I recommend keeping everything in `App.tsx` (about 30 more lines). The alternative is a small `TodoItem` component in its own file, which is cleaner but a new file. Which one?
3. **Save without a change.** If the title is unchanged, "Save" still sends the request and closes the field (simplest). Or it just closes without a request. I recommend the simplest.
4. **Only one row in edit mode.** Clicking "Edit" on another todo while one is open switches the edit to the new row and drops the unsaved text of the first. Is that fine?

## Verification
- `cd frontend && npm run check`, `npm run build`, `npm test` (existing tests only); `cd backend && npm run typecheck`.
- In the browser (manual, or with Playwright only if you ask): edit a title, Save, reload, compare with `curl http://localhost:3001/api/todos`; try Cancel; try an empty title; edit a done todo and check it stays done. Put the todo back to its original title afterwards.
- Search `frontend/src` for `fetch(`: only `api.ts` calls it.
