export interface GarageUnit {
  unitId: number;
  location?: string | null;
  status: 'maintenance' | 'occupied' | 'available';
  ownerId?: number | null;
  accessSettings?: string | null;
  garageNumber: string;
  size?: string | null;
  utilityData?: string | null;
}