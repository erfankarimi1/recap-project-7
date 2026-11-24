import type { Todo } from "./types";

// The backend allows requests from http://localhost:5173 (CORS), so the frontend can call it directly.
export const API_URL = "http://localhost:3001/api";

// Put all functions that talk to the API here (fetcher for `useSWR`, create, update, delete),
// so that your components never call `fetch` themselves.

/** Fetcher for `useSWR`: loads all todos. */
export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/todos`);
  if (!response.ok) {
    throw new Error("Could not load the todos");
  }
  return response.json();
}

/** Creates a todo. The API trims the title and answers 201 with the new todo. */
export async function createTodo(title: string): Promise<Todo> {
  const response = await fetch(`${API_URL}/todos`, {
    method: "POST",
    // Without this header, `express.json()` on the server does not read the body.
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error("Could not add the todo");
  }
  return response.json();
}
