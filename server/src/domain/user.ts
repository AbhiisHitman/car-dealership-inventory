export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** A user as stored, including the password hash. Never send this to a client. */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

/** The safe, public shape of a user. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function toPublicUser({ id, name, email, role }: UserRecord): PublicUser {
  return { id, name, email, role };
}
