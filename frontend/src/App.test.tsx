import { fireEvent, render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { createTodo, fetchTodos } from "./api";
import type { Todo } from "./types";

vi.mock("./api", () => ({
  API_URL: "http://localhost:3001/api",
  fetchTodos: vi.fn(),
  createTodo: vi.fn(),
}));

function renderApp(todos: Todo[] | Promise<Todo[]>) {
  vi.mocked(fetchTodos).mockReturnValue(Promise.resolve(todos));
  // A fresh cache for every test, so SWR does not share data between them.
  return render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <App />
    </SWRConfig>
  );
}

describe("App", () => {
  // Call counts must not leak from one test into the next.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a form with a text field and an Add button above the list", async () => {
    const { container } = renderApp([]);

    const field = await screen.findByRole("textbox");
    const button = screen.getByRole("button", { name: "Add" });
    const list = container.querySelector("ul.todo-list") as HTMLElement;

    // DOCUMENT_POSITION_FOLLOWING means: the list comes after the form.
    expect(field.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(button.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("disables the Add button for an empty or blank title", async () => {
    renderApp([]);

    const field = await screen.findByRole("textbox");
    const button = screen.getByRole("button", { name: "Add" }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);

    fireEvent.change(field, { target: { value: "   " } });
    expect(button.disabled).toBe(true);

    fireEvent.change(field, { target: { value: "Buy milk" } });
    expect(button.disabled).toBe(false);

    expect(createTodo).not.toHaveBeenCalled();
  });

  it("clears the field and shows the new todo after saving", async () => {
    const created: Todo = { id: "3", title: "Buy milk", done: false };
    // First load: empty list. After saving, SWR loads again: the list has the new todo.
    vi.mocked(fetchTodos).mockResolvedValueOnce([]).mockResolvedValue([created]);
    vi.mocked(createTodo).mockResolvedValue(created);
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <App />
      </SWRConfig>
    );

    const field = (await screen.findByRole("textbox")) as HTMLInputElement;
    fireEvent.change(field, { target: { value: "  Buy milk  " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByRole("checkbox", { name: "Buy milk" })).toBeTruthy();
    expect(createTodo).toHaveBeenCalledTimes(1);
    expect(createTodo).toHaveBeenCalledWith("Buy milk");
    expect(field.value).toBe("");
    expect(fetchTodos).toHaveBeenCalledTimes(2);
  });

  it("shows a loading message", () => {
    renderApp(new Promise<Todo[]>(() => {}));

    expect(screen.getByText("Loading...")).toBeTruthy();
  });

  it("shows a friendly message when there are no todos", async () => {
    renderApp([]);

    expect(await screen.findByText("No todos yet 🙂")).toBeTruthy();
  });

  it("shows a done todo checked and struck through", async () => {
    renderApp([
      { id: "1", title: "Buy milk", done: true },
      { id: "2", title: "Walk the dog", done: false },
    ]);

    const done = await screen.findByRole("checkbox", { name: "Buy milk" });
    const open = screen.getByRole("checkbox", { name: "Walk the dog" });

    expect(done).toHaveProperty("checked", true);
    expect(screen.getByText("Buy milk").className).toContain("done");
    expect(open).toHaveProperty("checked", false);
    expect(screen.getByText("Walk the dog").className).not.toContain("done");
  });
});
