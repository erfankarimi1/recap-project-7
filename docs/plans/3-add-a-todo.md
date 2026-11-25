# Plan for issue #3: Add a Todo (UI part only)

Branch: `feature/3-add-a-todo`
Plan file: `docs/plans/3-add-a-todo.md`

The API part is already done and was checked by the user (POST answers 201 with `{ id, title, done }`, 400 for a missing or empty title). It is not part of this plan.

## 1. Summary
The app gets a form above the list with a text field and an "Add" button. The button is disabled while the title is empty or only spaces. After saving, the field is cleared and SWR loads the list again, so the new todo appears.

## 2. Acceptance criteria to tests (UI criteria only)

| # | Criterion | Test | Asserts |
|---|---|---|---|
| 1 | Form with a text field and an "Add" button above the list | `frontend/src/App.test.tsx` > "shows a form with a text field and an Add button above the list" | a textbox and a button named "Add" exist; the form comes before the list in the DOM |
| 2 | The form does not send an empty title | `App.test.tsx` > "disables the Add button for an empty or blank title" | button disabled at start and after typing only spaces; enabled after typing text; `createTodo` is never called |
| 3 | After saving, the field is empty and the new todo is in the list | `App.test.tsx` > "clears the field and shows the new todo after saving" | `createTodo` called once with the trimmed title; field value is `""`; `fetchTodos` is called again and the new todo is shown |
| 4 | API call is a function in `api.ts` | `frontend/src/api.test.ts` (new) > "createTodo sends the title as JSON" | `fetch` gets `POST`, `Content-Type: application/json` and `JSON.stringify({ title })`; returns the new todo |
| 5 | `createTodo` fails loudly | `api.test.ts` > "createTodo throws when the response is not ok" | a 400 response makes the promise reject |
| 6 | New todo still there after reload and in the database | manual check with Playwright + `GET /api/todos` (not a unit test) | add a todo, reload the page, it is still listed; the API list contains it; then delete the test todo |

Component tests mock `./api` (`fetchTodos`, `createTodo`), so they need no backend and no network. `api.test.ts` mocks the global `fetch`.

## 3. Files that change
- `frontend/src/api.ts` (modified): add `createTodo(title: string): Promise<Todo>` (`POST`, JSON header, `JSON.stringify` body, throws when not ok). Components still never call `fetch`.
- `frontend/src/App.tsx` (modified): the form (controlled input, "Add" button disabled when `title.trim() === ""`), submit handler that calls `createTodo`, then `mutate("todos")` and clears the field. The form sits above the list.
- `frontend/src/App.test.tsx` (modified): add tests 1 to 3 and `createTodo` to the `./api` mock.
- `frontend/src/api.test.ts` (new): tests 4 and 5.
- `frontend/src/styles.css` (modified, only if needed): small styles for the form, in the existing plain CSS.
- `docs/plans/3-add-a-todo.md` (new): this plan, committed alone.

No new dependencies. The vitest and Testing Library setup from issue #2 is reused (`@testing-library/user-event` is NOT installed, so tests use `fireEvent`).

## 4. Out of scope
- All backend files (the API already works).
- Toggle done (issue 4), edit (issue 5), delete UI (issue 6).
- Loading, error and empty-state work (issue 7), filtering (issue 9).
- Showing an error message when saving fails (see open question 2).
- Authentication, CORS and `.env` changes, new dependencies.

## 5. Open questions
1. **Branch base.** The current branch `feature/2-see-all-todos` still has uncommitted frontend work from issue #2 (`App.tsx`, `api.ts`, `App.test.tsx`, `vite.config.ts`, `package*.json`, `CLAUDE.md`). Issue #3 needs that work. Should I commit it first and branch `feature/3-add-a-todo` from this branch, or do you want to merge #2 into `main` first?
2. **Save errors.** If the POST fails (for example the API is down), should the field keep its text and show nothing (error states are issue 7), or show a short message now? I recommend keeping the text and showing nothing.
3. **Empty message mismatch.** `App.tsx` shows "No todos yet 🙂" but the existing test expects "No todos yet." That test would fail today. Should I fix the text or the test as part of this issue, or leave it for #2?
4. **Where the form lives.** I recommend keeping it inside `App.tsx` (small, no extra file). Say so if you prefer a separate `AddTodoForm.tsx`.

## Verification
- `cd frontend && npm test` (all tests green), `npm run check`, `npm run build`.
- Search `frontend/src` for `fetch(`: only `api.ts` and `api.test.ts` mention it.
- In the browser with Playwright: add a todo, see the field cleared and the todo listed, reload, check `GET /api/todos`, delete the test todo.
