import { useEffect, useState, type FormEvent } from "react";
import useSWR from "swr";

import { createTodo, fetchTodos } from "./api";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // no page reload
    await createTodo(title.trim());
    setTitle("");
    // Tell SWR that the list is out of date: it loads it again from the API.
    // (This `mutate` is already bound to the "todos" key, so it takes no key.)
    await mutate();
  }

  return (
    <main>
      <header className="app-header">
        <h1>Todos</h1>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </header>
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
            <label className={todo.done ? "todo-title done" : "todo-title"}>
              <input type="checkbox" checked={todo.done} readOnly />
              {todo.title}
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
