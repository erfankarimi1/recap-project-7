# Plan for issue #9: Bonus - Filter the Todos (+ more filters, nicer styling)

> **Scope change after approval:** only the done / open filter is built (`?done=true|false`, the buttons "All", "Open", "Done"). The filters by title, priority and time below were dropped. The nicer styling stays.

Branch: `feature/9-filter-the-todos` (from the up-to-date `origin/main`, see open question 1)
Plan file: `docs/plans/9-filter-the-todos.md` (saved on disk only, NOT committed: plans stay out of the repository)

Issue #9 asks for a done / open filter. You asked for more: filter by title, by time and by priority, and a nicer look for the whole app. The plan keeps the rule of the issue: **the API does the filtering**, the browser does not.

## 1. Summary
`GET /api/todos` accepts optional query parameters: `done`, `priority`, `q` (title contains) and a due-time range (`dueFrom`, `dueTo`). The app gets a filter bar above the list (buttons "All", "Open" and "Done", a priority select, a title search field and two date fields). Every filter combination is its own `useSWR` key, so it is its own request. An empty result shows a message that fits the filter. The progress page keeps showing all todos. On top of this, the CSS is reworked so the app looks cleaner (spacing, cards, buttons, focus, mobile) in light and dark mode.

## 2. Acceptance criteria to checks
No new tests (your decision) and no Playwright unless you ask. Each criterion is checked by curl or by hand.

| # | Criterion | How it is done | How to check |
|---|---|---|---|
| 1 | API: `?done=true` only done, `?done=false` only open, no parameter all | `done` query parameter in `GET` in `backend/src/routes/todos.ts`, built into the mongoose filter | curl the three requests and compare with the full list |
| 2 | API: filter by priority, title, due time | `priority=low\|medium\|high`; `q=text` (case-insensitive "contains", special characters escaped); `dueFrom` / `dueTo` (ISO date-time, inclusive range on `dueAt`). Filters combine with AND. Todos without a time are left out when a time filter is used. | curl with each parameter and with combinations |
| 3 | API: bad values give 400, not 500 or an empty list | `done` other than `true`/`false`, a `priority` that is not allowed, a date that is not valid: 400 `{ "error": "<message>" }` | curl `?done=maybe`, `?priority=urgent`, `?dueFrom=nope` |
| 4 | UI: buttons "All", "Open", "Done"; the active one is visible | filter bar, `aria-pressed` and a highlighted style on the active button | by hand |
| 5 | UI: the app asks the API for the filtered list, no filtering in the browser | the filters go into the `useSWR` key and into the query string built in `api.ts`; there is no `.filter()` over the todos in `App.tsx` | browser Network tab; search `frontend/src` for `.filter(` on todos (only `Progress.tsx`, which counts, not hides) |
| 6 | UI: an empty result shows a message that fits the filter | "No open todos.", "No done todos.", "No todos match your filters." (and the existing "No todos yet" for the unfiltered empty list) | by hand |
| 7 | `docs/api-contract.md` describes the query parameters | new "Query parameters" section and a row in the table | read it |
| 8 | Progress page still counts all todos | `Progress.tsx` loads the unfiltered list itself (same SWR key as "All", so it is shared and cached) | by hand: set a filter, open "Progress", numbers do not change |
| 9 | Nicer styling | CSS only, see section 3; light and dark mode | by hand, on a wide and a narrow window |
| 10 | Nothing else broke | `npm run check`, `npm run build`, `npm test` (existing tests) in `frontend/`; `npm run typecheck` in `backend/` | all pass |

## 3. Files that change
- `backend/src/routes/todos.ts` (modified): read the query parameters in `GET /`, validate them, build the mongoose filter, return `toTodo` of the result. A tiny helper escapes the `q` text for the regular expression.
- `docs/api-contract.md` (modified): the query parameters, their rules and examples, in the same step.
- `frontend/src/types.ts` (modified): a `TodoFilters` type (`done`, `priority`, `q`, `dueFrom`, `dueTo`, all optional).
- `frontend/src/api.ts` (modified): `fetchTodos(filters)` builds the query string with `URLSearchParams`; still the only place that calls `fetch`.
- `frontend/src/App.tsx` (modified): filter state, the filter bar, the `useSWR` key `["todos", filters]`, empty messages per filter, a short delay (about 300 ms) before the title text is sent so not every key press is a request, a "Clear filters" button.
- `frontend/src/Progress.tsx` (modified): loads the unfiltered list itself.
- `frontend/src/styles.css` (modified): the nicer look: a bit more spacing and a larger page width, the todos as soft cards with a hover and a done state, a clear primary "Add" button, tidier buttons, a pill style for the filter buttons, better focus rings, a calmer header, mobile layout. Uses the existing CSS variables, so light and dark mode both work.
- `README.md` (modified, one line): mention the filters.
- `docs/plans/9-filter-the-todos.md` (new, on disk only): this plan.

No new dependencies.

## 4. Out of scope
- Sorting, paging, saving the filters in the URL or in the browser, full-text search over more than the title.
- Changes to the todo fields, the progress calculations or the edit / delete / add behaviour.
- New tests, Playwright checks (only when you ask).
- Splitting `App.tsx` into components (only if it is needed to keep the filter bar readable; I would rather keep it in `App.tsx`).

## 5. Open questions
1. **Branch base.** All earlier PRs (#10 to #14) are merged, and local `main` is behind `origin/main`. I recommend `git fetch` and then `git checkout -b feature/9-filter-the-todos origin/main`, so the branch starts from the merged state (your untracked `docs/plans/` stays as it is).
2. **Time filter.** Two date fields "From" and "To" (whole days, inclusive, in your local time). Or exact date-time fields, or presets such as "Today" and "This week"? I recommend the two date fields.
3. **Title filter.** "Contains", ignoring upper and lower case, with a 300 ms delay while typing. OK?
4. **Priority filter.** One priority at a time ("Any", "Low", "Medium", "High"), or several at once? I recommend one at a time.
5. **Styling direction.** I will keep your colours (white and `#243C4C`, the dark navy dark mode) and the system font, and polish spacing, shapes and states. Say so if you want a different look (for example a coloured accent).

## Verification
- `cd backend && npm run typecheck`; `cd frontend && npm run check`, `npm run build`, `npm test`.
- API with curl: `?done=true`, `?done=false`, no parameter, `?priority=high`, `?q=milk`, `?q=(`, `?dueFrom=...&dueTo=...`, a combination, and the three bad values (400). Create temporary todos for this and delete them afterwards.
- `docs/api-contract.md`: each new example gives exactly the documented status and body.
- In the browser (by you, or by me with Playwright only if you ask): every filter, the Network tab (one request per filter, no browser filtering), the empty messages, the progress page with a filter set, light and dark mode, a narrow window.
- Search `frontend/src` for `fetch(` (only `api.ts`).
