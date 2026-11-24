/** How important a todo is. */
export type Priority = "low" | "medium" | "high";

/** One todo, as the API sends it. `dueAt` is an ISO date-time string, or null when no time is chosen. */
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueAt: string | null;
};

/** What the form sends to create a todo. */
export type NewTodo = {
  title: string;
  priority: Priority;
  dueAt: string | null;
};
