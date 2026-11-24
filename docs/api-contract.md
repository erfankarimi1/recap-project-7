# API Contract

The backend runs on `http://localhost:3001`. Base path `/api`. Only JSON.

```ts
type Todo = {
  id: string; // the MongoDB ObjectId as a string
  title: string;
  done: boolean;
  priority: "low" | "medium" | "high";
  dueAt: string | null; // ISO date-time like "2026-11-30T09:00:00.000Z", or null when no time is chosen
};
```

A response contains exactly these five fields: no `_id` and no `__v`.

| Method and path         | Body                                                  | Success                  | Errors                                               |
| ----------------------- | ----------------------------------------------------- | ------------------------ | ---------------------------------------------------- |
| `GET /api/health`       |                                                       | 200 `{ "status": "ok" }` |                                                      |
| `GET /api/todos`        | optional query: `?done=true` or `?done=false`         | 200 `Todo[]`             | 400 `{ "error": "done must be true or false" }`      |
| `POST /api/todos`       | `{ "title": "...", "priority"?, "dueAt"? }`           | 201 `Todo`               | 400 `{ "error": "<message>" }`                       |
| `PUT /api/todos/:id`    | `{ "title", "done", "priority", "dueAt" }`            | 200 `Todo`               | 400 `{ "error": "<message>" }`, 404 `Todo not found` |
| `DELETE /api/todos/:id` |                                                       | 204, no body             | 404 `{ "error": "Todo not found" }`                  |
| any other route         |                                                       |                          | 404 `{ "error": "Not found" }`                       |

- `GET /api/todos?done=true` returns only the done todos, `?done=false` only the open ones. Without `done`, all todos are returned. Any other value for `done` gives 400.
- `POST` creates a todo with `done: false`. The title is trimmed. A missing or empty title gives 400. `priority` is optional and defaults to `"medium"`, `dueAt` is optional and defaults to `null`.
- `priority` must be `"low"`, `"medium"` or `"high"`. `dueAt` must be a valid date-time string or `null`. Anything else gives 400.
- Todos that were saved before `priority` and `dueAt` existed are returned with `priority: "medium"` and `dueAt: null`.
- `PUT` replaces `title`, `done`, `priority` and `dueAt`. Always send all four, also when you only change one of them.
- A body that is not valid JSON gives 400 `{ "error": "Invalid JSON body" }`. An `id` that is not a valid ObjectId gives 404.
- All errors look like `{ "error": "<message>" }`. An unexpected error gives 500 `{ "error": "Internal server error" }` without details.

## Examples

```http
POST /api/todos
{ "title": "Buy milk", "priority": "high", "dueAt": "2026-11-30T09:00:00.000Z" }

201
{ "id": "6aff79b9cd3147d2599d2f45", "title": "Buy milk", "done": false, "priority": "high", "dueAt": "2026-11-30T09:00:00.000Z" }
```

```http
PUT /api/todos/6aff79b9cd3147d2599d2f45
{ "title": "Buy oat milk", "done": true, "priority": "high", "dueAt": "2026-11-30T09:00:00.000Z" }

200
{ "id": "6aff79b9cd3147d2599d2f45", "title": "Buy oat milk", "done": true, "priority": "high", "dueAt": "2026-11-30T09:00:00.000Z" }
```

```http
POST /api/todos
{ "title": "" }

400
{ "error": "A todo needs a title, done must be true or false, priority must be low, medium or high and dueAt a valid date or null" }
```
