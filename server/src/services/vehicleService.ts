import type { Vehicle, VehicleSearchFilters } from '../domain/vehicle.js';
import { NotFoundError } from '../errors.js';
import type { VehicleRepository } from '../repositories/vehicleRepository.js';
import type { CreateVehicleInput, UpdateVehicleInput } from '../validation/schemas.js';

/** Catalogue management: everything about vehicles except stock movements. */
export class VehicleService {
  constructor(private readonly vehicles: VehicleRepository) {}

  create(input: CreateVehicleInput): Promise<Vehicle> {
    return this.vehicles.create(input);
  }

  list(): Promise<Vehicle[]> {
    return this.vehicles.findAll();
  }

  search(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    return this.vehicles.search(filters);
  }

  async get(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicles.findById(id);
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }

  async update(id: string, changes: UpdateVehicleInput): Promise<Vehicle> {
    const vehicle = await this.vehicles.update(id, changes);
    if (!vehicle) throw new NotFoundError('Vehicle not found');
    return vehicle;
  }

  async remove(id: string): Promise<void> {
    if (!(await this.vehicles.delete(id))) throw new NotFoundError('Vehicle not found');
  }
}
