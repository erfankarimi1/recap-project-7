import { useEffect, useState, type SubmitEvent } from "react";
import useSWR, { useSWRConfig } from "swr";

import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./api";
import Progress from "./Progress";
import type { Priority, Todo, TodoFilter } from "./types";

type Theme = "light" | "dark";

// The text to show for an error that was thrown by one of the functions in api.ts.
function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

// The saved choice wins. Without one, we follow the system setting.
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // localStorage can be blocked (private mode): just use the system setting.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  // Which todos the list shows. The filter is part of the SWR key, so every filter is its own
  // request: the API does the filtering, not the browser.
  const [filter, setFilter] = useState<TodoFilter>("all");
  const { data: todos, error, isLoading, mutate } = useSWR(
    ["todos", filter] as const,
    ([, current]) => fetchTodos(current),
  );
  const { mutate: reloadAll } = useSWRConfig();
  // The message of the last failed add, edit, delete or tick (null = nothing failed).
  const [actionError, setActionError] = useState<string | null>(null);
  // True while "Add" waits for the API: a double click must not create two todos.
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  // The value of the time field: "" (no time) or "2026-11-30T09:00" (local time).
  const [dueAt, setDueAt] = useState("");
  // Which page is shown: the list of todos or the progress page.
  const [page, setPage] = useState<"todos" | "progress">("todos");
  // The todo that is being edited (null = none) and the text in its field.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // The CSS reads `data-theme` on <html> to pick the light or the dark colors.
useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Not saving is fine, the toggle still works for this visit.
    }
  }, [theme]);

  // Runs a request. On success, SWR loads the list again. On failure, the message is shown and
  // nothing else changes: the list stays as it was and the code after the request does not run,
  // so the text the user typed is still there.
  async function run(request: () => Promise<unknown>) {
    setActionError(null);
    try {
      await request();
      // Tell SWR that every list (all, open, done) is out of date: they load again from the API.
      await reloadAll((key) => Array.isArray(key) && key[0] === "todos");
    } catch (error) {
      setActionError(errorText(error));
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); // no page reload
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    await run(async () => {
      await createTodo({
        title: title.trim(),
        priority,
        // The API wants an ISO string (with the time zone), so convert the local time.
        dueAt: dueAt === "" ? null : new Date(dueAt).toISOString(),
      });
      // Only after the todo was saved: clear the form.
      setTitle("");
      setPriority("medium");
      setDueAt("");
    });
    setIsSaving(false);
  }

  async function handleToggle(todo: Todo) {
    // Send the current title together with the flipped `done`.
    await run(() => updateTodo({ ...todo, done: !todo.done }));
  }

  async function handleDelete(todo: Todo) {
    // The API answers 204 without a body. Then the list is loaded again, without the todo.
    await run(() => deleteTodo(todo.id));
  }

  function handleEdit(todo: Todo) {
    // Start editing this todo (this closes the field of another one).
    setEditingId(todo.id);
    setEditTitle(todo.title);
  }

  function handleCancel() {
    // Nothing is sent: the old title stays.
    setEditingId(null);
  }

  async function handleSave(event: SubmitEvent<HTMLFormElement>, todo: Todo) {
    event.preventDefault(); // no page reload
    // PUT replaces the whole todo, so we send the new title with the unchanged `done`.
    await run(async () => {
      await updateTodo({ ...todo, title: editTitle.trim() });
      // Only after the todo was saved: close the field. After a failure it stays open with the text.
      setEditingId(null);
    });
  }

  return (
    <main>
      <header className="app-header">
        <h1>Todos</h1>
        <nav className="page-nav" aria-label="Pages">
          <button
            type="button"
            aria-pressed={page === "todos"}
            onClick={() => setPage("todos")}
          >
            Todos
          </button>
          <button
            type="button"
            aria-pressed={page === "progress"}
            onClick={() => setPage("progress")}
          >
            Progress
          </button>
        </nav>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>
      {page === "progress" && <Progress />}
      {page === "todos" && (
        <>
          <form className="todo-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="new-todo">
              New todo
            </label>
            <input
              id="new-todo"
              type="text"
              placeholder="What do you have to do?"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label className="visually-hidden" htmlFor="new-priority">
              Priority
            </label>
            <select
              id="new-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <label className="visually-hidden" htmlFor="new-due">
              Time (optional)
            </label>
            <input
              id="new-due"
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
            />
            {/* Not sent for an empty or blank title, and not twice while the request runs. */}
            <button type="submit" disabled={title.trim() === "" || isSaving}>
              Add
            </button>
          </form>
          <div className="filters" role="group" aria-label="Show todos">
            {(["all", "open", "done"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={filter === option}
                onClick={() => setFilter(option)}
              >
                {option === "all" ? "All" : option === "open" ? "Open" : "Done"}
              </button>
            ))}
          </div>
          {/* The message of a failed add, edit, delete or tick. The list below stays as it was. */}
          {actionError !== null && <p role="alert">{actionError}</p>}
          {error ? (
            // The list could not be loaded: the message and "Try again" replace the list.
            <div className="error-box" role="alert">
              <p>Could not load the todos.</p>
              <p>{errorText(error)}</p>
              <button type="button" onClick={() => mutate()}>
                Try again
              </button>
            </div>
          ) : (
            <>
              {isLoading && <p>Loading...</p>}
              {todos?.length === 0 && filter === "all" && (
                <>
                  <p>No todos yet 🙂</p>
                  <p>Add your first todo with the form above.</p>
                </>
              )}
              {todos?.length === 0 && filter === "open" && <p>No open todos. Nothing left to do 🎉</p>}
              {todos?.length === 0 && filter === "done" && <p>No done todos yet. Tick one off!</p>}
              <ul className="todo-list">
                {todos?.map((todo) => (
                  <li key={todo.id} className="todo-item">
                    {editingId === todo.id ? (
                      <form className="todo-edit" onSubmit={(event) => handleSave(event, todo)}>
                        <label className="visually-hidden" htmlFor={`edit-${todo.id}`}>
                          Title of the todo
                        </label>
                        <input
                          id={`edit-${todo.id}`}
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                        />
                        {/* An empty or blank title is never sent: "Save" stays disabled. */}
                        <button type="submit" disabled={editTitle.trim() === ""}>
                          Save
                        </button>
                        <button type="button" onClick={handleCancel}>
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <label className={todo.done ? "todo-title done" : "todo-title"}>
                          <input type="checkbox" checked={todo.done} onChange={() => handleToggle(todo)} />
                          {todo.title}
                        </label>
                        <span className={`tag tag-${todo.priority}`}>{todo.priority}</span>
                        {todo.dueAt !== null && (
                          <time className="due" dateTime={todo.dueAt}>
                            {new Date(todo.dueAt).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </time>
                        )}
                        <button type="button" onClick={() => handleEdit(todo)}>
                          Edit
                        </button>
                        <button type="button" className="delete" onClick={() => handleDelete(todo)}>
                          Delete
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </main>
  );
}
