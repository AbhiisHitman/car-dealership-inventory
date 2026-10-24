import { toPublicUser, type PublicUser, type Role } from '../domain/user.js';
import { ConflictError, UnauthorizedError } from '../errors.js';
import type { UserRepository } from '../repositories/userRepository.js';
import type { LoginInput, RegisterInput } from '../validation/schemas.js';
import type { PasswordHasher } from './passwordHasher.js';
import type { TokenService } from './tokenService.js';

export interface AuthResult {
  user: PublicUser;
  token: string;
}

/** Registration, login and identity lookup. Knows nothing about HTTP. */
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  /**
   * Creates an account. The role parameter is only used internally (admin seeding, tests);
   * the public register endpoint always creates regular users.
   */
  async register(input: RegisterInput, role: Role = 'user'): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    if (await this.users.findByEmail(email)) {
      throw new ConflictError('That email is already registered');
    }
    const passwordHash = await this.hasher.hash(input.password);
    const user = await this.users.create({ name: input.name.trim(), email, passwordHash, role });
    return this.issue(toPublicUser(user));
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());
    // Same message for unknown email and wrong password, so accounts cannot be enumerated.
    const valid = user ? await this.hasher.compare(input.password, user.passwordHash) : false;
    if (!user || !valid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    return this.issue(toPublicUser(user));
  }

  async getUser(id: string): Promise<PublicUser> {
    const user = await this.users.findById(id);
    if (!user) throw new UnauthorizedError('Account no longer exists');
    return toPublicUser(user);
  }

  /** Creates the configured admin account once; later calls are no-ops. */
  async ensureAdmin(admin: { email: string; password: string; name: string }): Promise<void> {
    if (await this.users.findByEmail(admin.email.toLowerCase())) return;
    await this.register(admin, 'admin');
  }

  private issue(user: PublicUser): AuthResult {
    return { user, token: this.tokens.sign({ id: user.id, role: user.role }) };
  }
}
