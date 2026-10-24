import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../domain/user.js';
import { ForbiddenError, UnauthorizedError } from '../errors.js';
import type { TokenPayload, TokenService } from '../services/tokenService.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

/** Requires a valid "Authorization: Bearer <jwt>" header and exposes the payload as req.auth. */
export function authenticate(tokens: TokenService) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError());
    }
    try {
      req.auth = tokens.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}

/** Must run after authenticate(). Rejects users whose role is not in the allowed list. */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new UnauthorizedError());
    if (!roles.includes(req.auth.role)) return next(new ForbiddenError('Admin access required'));
    next();
  };
}
