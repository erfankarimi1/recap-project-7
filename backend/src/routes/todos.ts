import { Router } from "express";
import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// The router is mounted on /api/todos in app.ts. The contract is in docs/api-contract.md.
todosRouter.get("/", async (request, response) => {
    const { done } = request.query;
    // explain it : 
    // Without `done` all todos are returned. Any other value than true or false is a bad request.
    if (done !== undefined && done !== "true" && done !== "false") {
        response.status(400).json({ error: "done must be true or false" });
        return;
    }

    // The database does the filtering: only the matching todos are sent.
    const todos = await TodoModel.find(done === undefined ? {} : { done: done === "true" });
    response.json(todos.map(toTodo));
});
todosRouter.post("/", async (request, response) => {
    const created = await TodoModel.create(request.body);
    // 201 = "created". toTodo turns the Mongo document ({ _id, __v, ... })
    // into the contract's shape: { id, title, done, priority, dueAt }.
    response.status(201).json(toTodo(created));
});
todosRouter.put("/:id", async (request, response) => {
    const updated = await TodoModel.findByIdAndUpdate(
        request.params.id,
        request.body,
        {
            new: true, // return the todo AFTER the update, not before
            runValidators: true, // update queries skip schema validation unless we ask for it
        },
    );

    // findByIdAndUpdate gives back null when no todo has this id.
    // The contract wants 404 here, not 200 with null.
    if (!updated) {
        response.status(404).json({ error: "Todo not found" });
        return;
    }

    response.json(toTodo(updated));
});
todosRouter.delete("/:id", async (request, response) => {
    const deleted = await TodoModel.findByIdAndDelete(request.params.id);

    if (!deleted) {
        response.status(404).json({ error: "Todo not found" });
        return;
    }
    response.status(204).end();
});
