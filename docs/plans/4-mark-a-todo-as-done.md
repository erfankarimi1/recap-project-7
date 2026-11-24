# Plan for issue #4: Mark a Todo as Done (UI part only)

Branch: `feature/4-mark-a-todo-as-done`
Plan file: `docs/plans/4-mark-a-todo-as-done.md`

The API part already works. It was checked earlier with real requests against the running API: `PUT /api/todos/:id` answers 200 with the new values (`{ id, title, done }`), 404 for an unknown id, 404 for an id like `abc`, and 400 for an empty title. It is not part of this plan.

## 1. Summary
Every todo already has a checkbox, but it is read-only. The checkbox becomes clickable: a click sends `PUT /api/todos/:id` with the current `title` and the flipped `done`, then SWR loads the list again, so the todo shows as done (checked, struck through) or open again. The state comes from the database, so it is the same after a reload.

## 2. Acceptance criteria to checks
The project has no new tests (decision of the user), so each criterion is checked by running the code, not by a test.

| # | Criterion | Check | What it shows |
|---|---|---|---|
| 1 | API: PUT answers 200 with the new values | already done (curl) | response has the new `done`, no `_id`, no `__v` |
| 2 | API: unknown id and `abc` answer 404 | already done (curl) | `{ "error": "Todo not found" }` |
| 3 | API: empty title answers 400 | already done (curl) | `{ "error": "..." }` |
| 4 | UI: clicking the checkbox sends the request and the todo changes in the list | Playwright on http://localhost:5173 | click an open todo: it becomes checked and struck through; click again: it is open again; the request is `PUT /api/todos/:id` with `{ title, done }` in the network list |
| 5 | The state is the same after a reload | Playwright + `GET /api/todos` | reload the page: same checkboxes; the API list has the same `done` values |
| 6 | Nothing else broke | `npm run check`, `npm run build`, `npm test` (existing tests) | all pass; the existing "done todo checked and struck through" test still passes |

## 3. Files that change
- `frontend/src/api.ts` (modified): add `updateTodo(todo: Todo): Promise<Todo>`. It sends `PUT` to `/todos/:id` with `Content-Type: application/json` and `JSON.stringify({ title, done })`, and throws when the response is not ok. Components still never call `fetch`.
- `frontend/src/App.tsx` (modified): remove `readOnly` from the checkbox, add `onChange` that calls `updateTodo({ ...todo, done: !todo.done })` and then `mutate()` (the `mutate` from `useSWR` is already bound to the "todos" key, so it takes no key).
- `docs/plans/4-mark-a-todo-as-done.md` (new): this plan, committed alone.

No new dependencies, no backend changes, no CSS changes (the `done` class already strikes the title through).

## 4. Out of scope
- All backend files (the API already works and was checked).
- Editing the title (issue 5), delete (issue 6).
- Error and loading states, for example a message when the request fails (issue 7). A failed request leaves the checkbox as the list says.
- Optimistic updates (see open question 2), filtering (issue 9), authentication, CORS, `.env`, new dependencies.
- New tests.

## 5. Open questions
1. **Branch base.** The PR for issue #3 is not merged yet, and `feature/3-add-a-todo` has two uncommitted changes (the `SubmitEvent` fix in `App.tsx` and the test text fix in `App.test.tsx`). Issue #4 builds on the form and the theme toggle of #3. Should I commit those two changes first and branch `feature/4-mark-a-todo-as-done` from `feature/3-add-a-todo`, or do you want #3 merged into `main` first? I recommend committing them and branching from `feature/3-add-a-todo`.
2. **Update style.** Simple: after the click, send the request, then reload the list (same as adding a todo in #3). The checkbox changes after a short delay. Or optimistic: the checkbox changes at once and rolls back if the request fails (more code). I recommend simple, to keep the code small.
3. **Failed request.** If the PUT fails, the checkbox stays as it was and no message is shown (messages are issue 7). The rejection is not caught, as in `handleSubmit`. Is that fine?
4. **`CLAUDE.md` and the plan of #3.** `CLAUDE.md` still says "Frontend stories come with tests, written test-first", which conflicts with your no-new-tests decision. Should I change that line as part of this issue, or leave it?

## Verification
- `cd frontend && npm run check`, `npm run build`, `npm test` (existing tests only).
- Start the API and the app (dev servers). In the browser with Playwright: tick "Kufen", see it checked and struck through, untick it, check the network request body, reload, compare with `curl http://localhost:3001/api/todos`. Put the todo back to its original state afterwards.
- Search `frontend/src` for `fetch(`: only `api.ts` calls it.
