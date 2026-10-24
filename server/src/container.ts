import type { AppConfig } from './config.js';
import type { Database } from './db/database.js';
import { InventoryRepository } from './repositories/inventoryRepository.js';
import { UserRepository } from './repositories/userRepository.js';
import { VehicleRepository } from './repositories/vehicleRepository.js';
import { AuthService } from './services/authService.js';
import { InventoryService } from './services/inventoryService.js';
import { BcryptPasswordHasher } from './services/passwordHasher.js';
import { TokenService } from './services/tokenService.js';
import { VehicleService } from './services/vehicleService.js';

/** Composition root: wires repositories and services together once per process. */
export function buildContainer(db: Database, config: AppConfig) {
  const tokenService = new TokenService(config.jwtSecret, config.jwtExpiresIn);
  const users = new UserRepository(db);
  const authService = new AuthService(users, new BcryptPasswordHasher(), tokenService);
  const vehicles = new VehicleRepository(db);
  const vehicleService = new VehicleService(vehicles);
  const inventoryService = new InventoryService(new InventoryRepository(db), vehicles);
  return { db, tokenService, authService, vehicles, vehicleService, inventoryService };
}

export type Container = ReturnType<typeof buildContainer>;
