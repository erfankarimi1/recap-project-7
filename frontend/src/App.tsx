import { useEffect, useState, type SubmitEvent } from "react";
import useSWR from "swr";

import { createTodo, deleteTodo, fetchTodos, updateTodo } from "./api";
import Progress from "./Progress";
import type { Priority, Todo } from "./types";

type Theme = "light" | "dark";

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
  const { data: todos, isLoading, mutate } = useSWR("todos", fetchTodos);
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

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault(); // no page reload
    await createTodo({
      title: title.trim(),
      priority,
      // The API wants an ISO string (with the time zone), so convert the local time.
      dueAt: dueAt === "" ? null : new Date(dueAt).toISOString(),
    });
    setTitle("");
    setPriority("medium");
    setDueAt("");
    // Tell SWR that the list is out of date: it loads it again from the API.
    // (This `mutate` is already bound to the "todos" key, so it takes no key.)
    await mutate();
  }

  async function handleToggle(todo: Todo) {
    // Send the current title together with the flipped `done`, then reload the list.
    await updateTodo({ ...todo, done: !todo.done });
    await mutate();
  }

  async function handleDelete(todo: Todo) {
    // The API answers 204 without a body. Then the list is loaded again, without the todo.
    await deleteTodo(todo.id);
    await mutate();
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
    await updateTodo({ ...todo, title: editTitle.trim() });
    setEditingId(null);
    await mutate();
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
      {page === "progress" && <Progress todos={todos ?? []} />}
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
        {/* An empty or blank title is never sent: the button stays disabled. */}
        <button type="submit" disabled={title.trim() === ""}>
          Add
        </button>
      </form>
      {isLoading && <p>Loading...</p>}
      {todos?.length === 0 && <p>No todos yet 🙂</p>}
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
    </main>
  );
}
