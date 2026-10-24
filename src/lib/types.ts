/** Shapes returned by the API. Kept in sync with server/src/domain by hand. */
export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number | null;
  color: string | null;
  description: string | null;
  imageUrl: string | null;
  imageCredit: string | null;
  imageSourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VehicleInput = Pick<Vehicle, 'make' | 'model' | 'category' | 'price' | 'quantity'> &
  Partial<Pick<Vehicle, 'year' | 'color' | 'description' | 'imageUrl' | 'imageCredit' | 'imageSourceUrl'>>;

export interface Purchase {
  id: string;
  vehicleId: string | null;
  vehicleLabel: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

export interface InventoryStats {
  models: number;
  unitsInStock: number;
  outOfStock: number;
  inventoryValue: number;
  categories: string[];
}

export interface SearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}
