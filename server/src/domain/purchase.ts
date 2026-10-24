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
