import type { AppConfig } from './config.js';
import type { Database } from './db/database.js';
import { UserRepository } from './repositories/userRepository.js';
import { AuthService } from './services/authService.js';
import { BcryptPasswordHasher } from './services/passwordHasher.js';
import { TokenService } from './services/tokenService.js';

/** Composition root: wires repositories and services together once per process. */
export function buildContainer(db: Database, config: AppConfig) {
  const tokenService = new TokenService(config.jwtSecret, config.jwtExpiresIn);
  const users = new UserRepository(db);
  const authService = new AuthService(users, new BcryptPasswordHasher(), tokenService);
  return { db, tokenService, authService };
}

export type Container = ReturnType<typeof buildContainer>;
