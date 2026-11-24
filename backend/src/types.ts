/** How important a todo is. */
export type Priority = "low" | "medium" | "high";

/** What the API sends: one todo. `dueAt` is an ISO date-time string or null (no time chosen). */
export type Todo = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueAt: string | null;
};

/** What the API receives for POST and PUT (and what the database stores: `dueAt` as a Date). */
export type NewTodo = {
  title: string;
  done: boolean;
  priority: Priority;
  dueAt: Date | null;
};
