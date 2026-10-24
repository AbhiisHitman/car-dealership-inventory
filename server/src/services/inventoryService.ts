import type { InventoryStats, Purchase } from '../domain/purchase.js';
import type { Vehicle } from '../domain/vehicle.js';
import { ConflictError, NotFoundError } from '../errors.js';
import type { InventoryRepository } from '../repositories/inventoryRepository.js';
import type { VehicleRepository } from '../repositories/vehicleRepository.js';

/** Buying and restocking. Business rules about stock live here, not in the routes. */
export class InventoryService {
  constructor(
    private readonly inventory: InventoryRepository,
    private readonly vehicles: VehicleRepository
  ) {}

  async purchase(vehicleId: string, userId: string, quantity = 1): Promise<{ vehicle: Vehicle; purchase: Purchase }> {
    const result = await this.inventory.purchase(vehicleId, userId, quantity);
    if (result) return result;

    // The atomic update matched nothing: work out why so the client gets a useful message.
    const vehicle = await this.vehicles.findById(vehicleId);
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    if (vehicle.quantity === 0) throw new ConflictError(`${vehicle.make} ${vehicle.model} is out of stock`);
    throw new ConflictError(`Only ${vehicle.quantity} ${vehicle.make} ${vehicle.model} left in stock`);
  }

  async restock(vehicleId: string, quantity: number): Promise<Vehicle> {
    const vehicle = await this.inventory.restock(vehicleId, quantity);
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }

  purchasesFor(userId: string): Promise<Purchase[]> {
    return this.inventory.purchasesForUser(userId);
  }

  stats(): Promise<InventoryStats> {
    return this.inventory.stats();
  }
}
