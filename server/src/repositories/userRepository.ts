import type { Database } from '../db/database.js';
import type { Role, UserRecord } from '../domain/user.js';

interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
}

const toUser = (row: UserRow): UserRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  createdAt: new Date(row.created_at)
});

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export class UserRepository {
  constructor(private readonly db: Database) {}

  async create(user: NewUser): Promise<UserRecord> {
    const [row] = await this.db.query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
      [user.name, user.email, user.passwordHash, user.role]
    );
    return toUser(row);
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const [row] = await this.db.query<UserRow>(`SELECT * FROM users WHERE email = $1`, [email]);
    return row ? toUser(row) : undefined;
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    const [row] = await this.db.query<UserRow>(`SELECT * FROM users WHERE id = $1`, [id]);
    return row ? toUser(row) : undefined;
  }
}
