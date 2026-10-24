import type { Vehicle, VehicleSearchFilters } from '../domain/vehicle.js';
import { VehicleNotFoundError } from '../errors.js';
import type { VehicleRepository } from '../repositories/vehicleRepository.js';
import type { CreateVehicleInput, UpdateVehicleInput } from '../validation/schemas.js';

/** Repositories return undefined for a missing row; services report it as a 404. */
export function orNotFound(vehicle: Vehicle | undefined): Vehicle {
  if (!vehicle) throw new VehicleNotFoundError();
  return vehicle;
}

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
    return orNotFound(await this.vehicles.findById(id));
  }

  async update(id: string, changes: UpdateVehicleInput): Promise<Vehicle> {
    return orNotFound(await this.vehicles.update(id, changes));
  }

  async remove(id: string): Promise<void> {
    if (!(await this.vehicles.delete(id))) throw new VehicleNotFoundError();
  }
}
