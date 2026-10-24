import type { z } from 'zod';
import { ValidationError } from '../errors.js';

/** Parses untrusted input with a zod schema, converting failures into a 400 ValidationError. */
export function validate<S extends z.ZodType>(schema: S, input: unknown): z.infer<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      result.error.issues.map(issue => ({ field: issue.path.join('.') || undefined, message: issue.message }))
    );
  }
  return result.data;
}
