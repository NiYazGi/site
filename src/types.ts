export type CategoryId = 'transport' | 'electricity' | 'shopping';

export type TransportMode = 'car_gasoline' | 'car_diesel' | 'car_ev' | 'bus' | 'walk' | 'bike';

export interface ActionInput {
  category: CategoryId;
  // Transport
  distanceKm?: number;
  transportMode?: TransportMode;
  passengers?: number;
  durationMin?: number;
  // Electricity
  kwh?: number;
  energySource?: 'grid' | 'solar' | 'wind';
  // Shopping
  itemCost?: number;
  itemType?: 'clothing' | 'electronics' | 'food' | 'other';
  isLocal?: boolean;
}

export interface CostBreakdown {
  personal: number; // личная стоимость
  environmental: number; // экологическая стоимость
  social: number; // социальные издержки
  trueCost: number; // sum
}

export interface ActionResult {
  id: string;
  category: CategoryId;
  label: string;
  icon: string;
  timestamp: number;
  input: ActionInput;
  costs: CostBreakdown;
  co2Kg: number;
  resourcesUsed: number; // liters / kWh / items
  resourceUnit: string;
  appliedOptimization: boolean;
  originalCosts?: CostBreakdown;
  originalCo2?: number;
}

export interface Recommendation {
  id: string;
  actionId: string;
  title: string;
  description: string;
  alternativeLabel: string;
  potentialSavings: number;
  co2ReductionPct: number;
  co2ReductionKg: number;
  newTrueCost: number;
  newCo2: number;
  applied: boolean;
}

export interface DashboardMetrics {
  trueCostTotal: number;
  environmentalTotal: number;
  co2Total: number;
  potentialSavings: number;
  ecoScore: number;
  personalTotal: number;
  socialTotal: number;
  actionCount: number;
}

export interface ImpactBreakdown {
  category: CategoryId;
  label: string;
  icon: string;
  percentage: number;
  trueCost: number;
  co2: number;
  color: string;
}
