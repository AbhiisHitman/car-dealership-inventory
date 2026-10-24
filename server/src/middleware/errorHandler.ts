import type { NextFunction, Request, Response } from 'express';
import { AppError, NotFoundError } from '../errors.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
}

/** Translates thrown errors into a consistent JSON shape: { error: { message, details? } }. */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { message: error.message, details: error.details } });
    return;
  }
  // Malformed JSON bodies are rejected by express.json() with a 400 status.
  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: { message: 'Malformed JSON body' } });
    return;
  }
  console.error(error);
  res.status(500).json({ error: { message: 'Something went wrong on our side' } });
}
