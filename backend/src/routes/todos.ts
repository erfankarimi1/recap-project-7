import { Router } from "express";
import { TodoModel, toTodo } from "../models/Todo";

export const todosRouter = Router();

// Issue 2: add the routes here. The router is already mounted on /api/todos in app.ts.
// GET    /api/todos       -> 200 with the list of todos
// POST   /api/todos       -> 201 with the new todo
// PUT    /api/todos/:id   -> 200 with the updated todo, 404 for an unknown id
// DELETE /api/todos/:id   -> 204 without a body, 404 for an unknown id
//

// The contract is in docs/api-contract.md at the root of the project.
todosRouter.get("/", async (_request, response) => {
    const todos = await TodoModel.find();
    response.json(todos.map(toTodo));
});
todosRouter.post("/", async (request, response) => {
    // create() validates the body against the schema. If it is invalid, the
    // error handler answers with 400 { "error": "..." }.
    const created = await TodoModel.create(request.body);

    // 201 = "created". toTodo turns the Mongo document ({ _id, __v, ... })
    // into the contract's shape: { id, title, done }.
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
