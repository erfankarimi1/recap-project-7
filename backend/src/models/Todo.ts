import {Schema, model, type HydratedDocument} from 'mongoose';
import type {Todo, NewTodo} from '../types.js';

const todoSchema = new Schema<NewTodo>({
    title: {type: String, required: true, trim: true},
    done: {type: Boolean, default: false},
    // Old todos have no priority or time in the database: the defaults fill them in when they are read.
    priority: {type: String, enum: ["low", "medium", "high"], default: "medium"},
    dueAt: {type: Date, default: null}
});
export const TodoModel = model("Todo", todoSchema);

/** Turns a mongoose document into the plain object of the API contract: no `_id` and no `__v`. */
export function toTodo(todo: HydratedDocument<NewTodo>): Todo {
    return {
        id : todo.id,
        title : todo.title,
        done : todo.done,
        priority : todo.priority,
        // A Date becomes an ISO string like "2026-11-30T09:00:00.000Z" (JSON has no Date type).
        dueAt : todo.dueAt ? todo.dueAt.toISOString() : null
    };
}
