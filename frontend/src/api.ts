import type { NewTodo, Todo, TodoFilter } from "./types";

// The backend allows requests from http://localhost:5173 (CORS), so the frontend can call it directly.
export const API_URL = "http://localhost:3001/api";

// Put all functions that talk to the API here (fetcher for `useSWR`, create, update, delete),
// so that your components never call `fetch` themselves.

/**
 * The one place that calls `fetch`. It throws an Error whose message can be shown to the user:
 * - the backend cannot be reached (it is down, or the network is gone), or
 * - the API answers an error. Its body is `{ "error": "<message>" }`, `fallback` is used when it has no message.
 */
async function request(path: string, fallback: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error("Could not reach the server. Is the backend running?");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: unknown } | null;
    throw new Error(typeof body?.error === "string" ? body.error : fallback);
  }
  return response;
}

/** Fetcher for `useSWR`: loads the todos. The API does the filtering (`?done=true` or `?done=false`). */
export async function fetchTodos(filter: TodoFilter = "all"): Promise<Todo[]> {
  const query = filter === "all" ? "" : `?done=${filter === "done"}`;
  const response = await request(`/todos${query}`, "The server answered with an error");
  return response.json();
}

/** Updates a todo. PUT replaces the whole todo, so we always send `title` and `done`. */
export async function updateTodo(todo: Todo): Promise<Todo> {
  const response = await request(`/todos/${todo.id}`, "Could not update the todo", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: todo.title,
      done: todo.done,
      priority: todo.priority,
      dueAt: todo.dueAt,
    }),
  });
  return response.json();
}

/** Creates a todo. The API trims the title and answers 201 with the new todo. */
export async function createTodo(todo: NewTodo): Promise<Todo> {
  const response = await request("/todos", "Could not add the todo", {
    method: "POST",
    // Without this header, `express.json()` on the server does not read the body.
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return response.json();
}

/** Deletes a todo. The API answers 204 without a body, so there is nothing to read. */
export async function deleteTodo(id: string): Promise<void> {
  await request(`/todos/${id}`, "Could not delete the todo", { method: "DELETE" });
}
