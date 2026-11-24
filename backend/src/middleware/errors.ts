import type { ErrorRequestHandler, RequestHandler } from "express";
import { Error as MongooseError } from "mongoose";

/** Runs when no route matched. */
export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ error: "Not found" });
};

/** Runs when a route or a middleware threw an error. Express knows it by the four parameters. */
export const errorHandler: ErrorRequestHandler = (
  err,
  _request,
  response,
  _next
) => {
  // express.json() throws a SyntaxError with status 400 for a body that is not valid JSON.
  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    response.status(400).json({ error: "Invalid JSON body" });
    return;
  }
  // mongoose rejects data that breaks the schema, for example a todo without a title.
  if (err instanceof MongooseError.ValidationError) {
    response.status(400).json({
      error:
        "A todo needs a title, done must be true or false, priority must be low, medium or high and dueAt a valid date or null",
    });
    return;
  }
  if (err instanceof MongooseError.CastError) {
    // mongoose cannot turn an id like "abc" into an ObjectId: no todo has this id.
    if (err.path === "_id") {
      response.status(404).json({ error: "Todo not found" });
      return;
    }
    // Any other field that cannot be cast (for example dueAt: "not a date" in a PUT) is bad input.
    response.status(400).json({
      error:
        "A todo needs a title, done must be true or false, priority must be low, medium or high and dueAt a valid date or null",
    });
    return;
  }
  // Log the details on the server, send nothing internal to the client.
  console.error(err);
  response.status(500).json({ error: "Internal server error" });
};
