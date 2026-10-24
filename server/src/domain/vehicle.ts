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

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
