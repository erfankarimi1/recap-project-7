import {Schema, model, type HydratedDocument} from 'mongoose';
import type {Todo, NewTodo} from '../types.js';
// Issue 2: write the mongoose schema, the model and `toTodo` here.
// Look at the Book model of Backend MongoDB: it has the same shape.
// A todo has a `title` (a required string, trimmed) and `done` (a boolean, default `false`).
// The types `` and `NewTodo` are already in `../types.ts`.

const todoSchema = new Schema<NewTodo>({
    title: {type: String, required: true, trim: true},
    done: {type: Boolean, default: false}
});
export const TodoModel = model("Todo", todoSchema);
 
// where should i write the toTodo function? in this file or in the routes file?
// I think it should be in this file, because it is related to the model.
export function toTodo(todo: HydratedDocument<NewTodo>): Todo {
    return {
        id : todo.id,
        title : todo.title,
        done : todo.done
    };
}
// discribe the toTodo function: it takes a HydratedDocument<> and
//  returns a  object. It is used to convert the mongoose document to a plain object that can be sent to the client.

//the todos are shown as a list. A done todo is shown as done (a checked checkbox and a struck-through title). 
// what shoud i write in the backend to make this happen?
// You don't need to do anything in the backend for this. The backend just sends the data (the todos) to the frontend. The frontend is responsible for rendering the todos as a list and showing a done todo as done (a checked checkbox and a struck-through title).
// where in the back end should i write the code to make the todos shown as a list? in the routes file or in the model file?
// i know that  just tell me where in the frontend should i start coding 