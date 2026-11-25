# Plan for issue #8: Hand Over - Ready for Recap Project 8

Branch: `feature/8-hand-over-ready-for-recap`
Plan file: `docs/plans/8-hand-over-ready-for-recap.md` (saved on disk only, NOT committed: plans stay out of the repository, as you asked)

Documentation and cleanup. No new features, no backend or frontend behaviour changes.

## 1. Summary
The project is left so that a stranger can start it, understand it and extend it. The README gets the real start instructions and a short note on adding an owner to each todo. The API contract, `.env.example` and the file structure are checked and cleaned. All checks must pass, and every user story works end to end.

## 2. Acceptance criteria to checks
No new tests (your decision) and no Playwright unless you ask. Each criterion is checked by a command or by hand.

| # | Criterion | How it is done | How to check |
|---|---|---|---|
| 1 | README explains starting from a fresh clone | rewrite the "Run it" section: requirements (Node 22, MongoDB local or Atlas), `npm install` in `backend/` and `frontend/`, copy `backend/.env.example` to `backend/.env` and fill it in, `npm run dev` in both, URLs (app http://localhost:5173, API http://localhost:3001/api/health), the check commands | read it top to bottom as a newcomer; ideally a classmate follows it |
| 2 | `docs/api-contract.md` matches the API, every endpoint and error | compare every row, rule and example of the contract with the running API (curl instead of Bruno): `GET`, `POST`, `PUT`, `DELETE`, invalid JSON, bad id, bad priority and `dueAt`, unknown route; fix the contract where it differs | each example gives exactly the documented status and body |
| 3 | `.env.example` lists every variable the code reads, placeholders only; no secret in the repo or history | the code reads `MONGODB_URI` and `PORT` (both already listed). Checked: the only tracked file with a `user:password@` connection string, now and in the initial commit, is `.env.example` itself, and it holds a placeholder. `backend/.env` is not tracked. | `git grep -l` for connection strings (file names only, never print values); `backend/.env` is not read |
| 4 | Clean structure: separate files, API calls only in `api.ts`, no leftover code or unused file | remove the starter and note comments in `backend/src/models/Todo.ts` ("Issue 2: ...", the "where should i write" and "discribe" notes) and the "Issue 2" block in `backend/src/routes/todos.ts`; fix the odd JSX indentation in `frontend/src/App.tsx`; no behaviour change. Decide about the course scaffolding (open question 2). | `grep` for those comments and for `fetch(` (only `api.ts`); `git ls-files` review |
| 5 | The three checks run without errors | no code to write | `npm run typecheck` (backend), `npm run check` and `npm run build` (frontend), plus `npm test` |
| 6 | README: 2 or 3 sentences on where to add an owner per todo, backend and frontend | new README section "Where an owner would go" | read it |
| 7 | Every user story works end to end in the browser | not code. Needs a run through the app by hand: see todos, add, tick, edit, delete, error state with the backend stopped (also priority, time and the progress page) | by you, or by me with Playwright only if you ask. Not claimed until done. |

The two tasks of the issue (a classmate starts the project from the README, and the demo) are for you.

## 3. Files that change
- `README.md` (modified): start instructions, URLs, scripts, features, the owner note.
- `docs/api-contract.md` (modified, only if the check finds a difference).
- `backend/.env.example` (modified, only if the check finds a missing variable; today none is missing).
- `backend/src/models/Todo.ts` (modified): remove leftover starter and note comments only.
- `backend/src/routes/todos.ts` (modified): remove the leftover starter comment block only.
- `frontend/src/App.tsx` (modified): fix indentation only.
- Possibly `CLAUDE.md` (see open question 3).
- No new files in the repository. The plan file stays on disk.

## 4. Out of scope
- Security and tests (that is Recap Project 8), authentication, deployment, owners themselves (only the README note).
- New features, behaviour changes, new dependencies, refactoring beyond the cleanup above.
- Splitting `App.tsx` into components.

## 5. Open questions
1. **Branch base.** `feature/7-loading-error-and-empty-states` is pushed but has no PR, and `chore/remove-plans` (removes the plans from `main`) has no PR yet either. I recommend branching `feature/8-hand-over-ready-for-recap` from `feature/7-loading-error-and-empty-states`, as before.
2. **Course scaffolding.** The repository still tracks `.github/templates/*`, `.github/scripts/create-issues.js`, `.github/workflows/create-issues.yml` and `docs/github-repository-template.md`. They create the course issues and are not part of the app. Keep them (safe, they belong to the course) or remove them as "unused files"? I recommend keeping them.
3. **`CLAUDE.md`.** It still says "Frontend stories come with tests, written test-first", which you changed your mind about. Change that line, or leave it?
4. **Part B features in the README.** Should the README mention the priority, the due time and the progress page, which are not in the original stories? I recommend a short "Features" list that includes them.

## Verification
- `cd backend && npm run typecheck`; `cd frontend && npm run check`, `npm run build`, `npm test`.
- API contract: run every example against the running API with curl and compare status and body.
- `git grep -l` for connection strings (file names only); `git ls-files | grep -i env` shows only `.env.example`.
- Search `backend/src` and `frontend/src` for leftover note comments, and for `fetch(` (only `api.ts`).
- The browser run-through (criterion 7) by you, or by me with Playwright if you ask.
