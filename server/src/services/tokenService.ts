import jwt, { type SignOptions } from 'jsonwebtoken';
import { ROLES, type Role } from '../domain/user.js';
import { UnauthorizedError } from '../errors.js';

export interface TokenPayload {
  id: string;
  role: Role;
}

/** Issues and verifies the JWTs that protect the API. */
export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): string {
    return jwt.sign({ role: payload.role }, this.secret, {
      subject: payload.id,
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
      algorithm: 'HS256'
    });
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
      if (typeof decoded === 'string' || !decoded.sub || !ROLES.includes(decoded.role)) {
        throw new UnauthorizedError('Invalid token');
      }
      return { id: decoded.sub, role: decoded.role };
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}
