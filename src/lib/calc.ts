import type {
  ActionInput,
  CostBreakdown,
  ActionResult,
  CategoryId,
  ImpactBreakdown,
  DashboardMetrics,
} from '@/types';

// ─── Constants (Kazakhstan context, ₸) ──────────────────────────────

const FUEL_PRICE_PER_LITER = 280; // ₸/L (avg AI-92)
const EV_KWH_PRICE = 22; // ₸/kWh
const GRID_KWH_PRICE = 24; // ₸/kWh
const BUS_FARE = 90; // ₸ per trip

// CO₂ emission factors (kg CO₂ per unit)
const CO2_PER_LITER_GASOLINE = 2.31; // kg/L
const CO2_PER_LITER_DIESEL = 2.68; // kg/L
const CO2_PER_KWH_GRID = 0.58; // kg/kWh (KZ grid mix — coal-heavy)
const CO2_PER_KWH_RENEWABLE = 0.04; // kg/kWh
const CO2_PER_KM_BUS = 0.08; // kg/km per passenger

// Social cost of carbon — ₸ per kg CO₂
const SOCIAL_COST_PER_KG_CO2 = 28; // approximate social cost converted to ₸

// Environmental damage multiplier — converts CO₂ to ₸ environmental cost
const ECO_COST_PER_KG_CO2 = 54; // ₸/kg

// Fuel consumption (L/100km)
const FUEL_CONSUMPTION: Record<string, number> = {
  car_gasoline: 8.5,
  car_diesel: 7.2,
  car_ev: 0, // uses kWh
  bus: 35,
  walk: 0,
  bike: 0,
};

// EV efficiency kWh/100km
const EV_KWH_PER_100KM = 18;

// ─── Category metadata ───────────────────────────────────────────────

export const CATEGORIES: Record<
  CategoryId,
  { label: string; icon: string; color: string; description: string }
> = {
  transport: {
    label: 'Транспорт',
    icon: '🚗',
    color: '#3b82f6',
    description: 'Поездки на автомобиле, общественном транспорте, пешком',
  },
  electricity: {
    label: 'Электроэнергия',
    icon: '⚡',
    color: '#f59e0b',
    description: 'Потребление электроэнергии дома',
  },
  shopping: {
    label: 'Покупки',
    icon: '🛒',
    color: '#10b981',
    description: 'Одежда, электроника, товары',
  },
};

export const ALL_CATEGORIES: {
  id: CategoryId | string;
  label: string;
  icon: string;
  enabled: boolean;
}[] = [
  { id: 'transport', label: 'Транспорт', icon: '🚗', enabled: true },
  { id: 'electricity', label: 'Электроэнергия', icon: '⚡', enabled: true },
  { id: 'shopping', label: 'Покупки', icon: '🛒', enabled: true },
  { id: 'water', label: 'Вода', icon: '💧', enabled: false },
  { id: 'food', label: 'Еда', icon: '🍔', enabled: false },
  { id: 'delivery', label: 'Доставка', icon: '📦', enabled: false },
  { id: 'clothing', label: 'Одежда', icon: '👕', enabled: false },
  { id: 'waste', label: 'Отходы', icon: '🗑️', enabled: false },
  { id: 'home', label: 'Дом', icon: '🏠', enabled: false },
];

// ─── Transport modes ─────────────────────────────────────────────────

export const TRANSPORT_MODES: {
  id: string;
  label: string;
  icon: string;
}[] = [
  { id: 'car_gasoline', label: 'Авто (бензин)', icon: '🚗' },
  { id: 'car_diesel', label: 'Авто (дизель)', icon: '🚙' },
  { id: 'car_ev', label: 'Электромобиль', icon: '🔋' },
  { id: 'bus', label: 'Автобус', icon: '🚌' },
  { id: 'walk', label: 'Пешком', icon: '🚶' },
  { id: 'bike', label: 'Велосипед', icon: '🚴' },
];

// ─── Calculation engine ──────────────────────────────────────────────

export function calculateAction(input: ActionInput): {
  costs: CostBreakdown;
  co2Kg: number;
  resourcesUsed: number;
  resourceUnit: string;
  label: string;
  icon: string;
} {
  switch (input.category) {
    case 'transport':
      return calcTransport(input);
    case 'electricity':
      return calcElectricity(input);
    case 'shopping':
      return calcShopping(input);
    default:
      return {
        costs: { personal: 0, environmental: 0, social: 0, trueCost: 0 },
        co2Kg: 0,
        resourcesUsed: 0,
        resourceUnit: '',
        label: 'Неизвестно',
        icon: '❓',
      };
  }
}

function calcTransport(input: ActionInput) {
  const km = input.distanceKm ?? 0;
  const mode = input.transportMode ?? 'car_gasoline';
  const passengers = input.passengers ?? 1;

  let personal = 0;
  let co2 = 0;
  let resourcesUsed = 0;
  let label = '';
  let icon = '🚗';

  if (mode === 'car_gasoline' || mode === 'car_diesel') {
    const consumption = FUEL_CONSUMPTION[mode]; // L/100km
    const liters = (km * consumption) / 100;
    resourcesUsed = liters;
    personal = liters * FUEL_PRICE_PER_LITER;
    const co2PerLiter = mode === 'car_diesel' ? CO2_PER_LITER_DIESEL : CO2_PER_LITER_GASOLINE;
    co2 = liters * co2PerLiter;
    label = `Поездка на авто (${mode === 'car_diesel' ? 'дизель' : 'бензин'})`;
    icon = mode === 'car_diesel' ? '🚙' : '🚗';
  } else if (mode === 'car_ev') {
    const kwh = (km * EV_KWH_PER_100KM) / 100;
    resourcesUsed = kwh;
    personal = kwh * EV_KWH_PRICE;
    co2 = kwh * CO2_PER_KWH_GRID; // charging from grid
    label = 'Поездка на электромобиле';
    icon = '🔋';
  } else if (mode === 'bus') {
    personal = BUS_FARE;
    co2 = km * CO2_PER_KM_BUS;
    resourcesUsed = km;
    label = 'Поездка на автобусе';
    icon = '🚌';
  } else if (mode === 'walk') {
    personal = 0;
    co2 = 0;
    resourcesUsed = km;
    label = 'Поездка пешком';
    icon = '🚶';
  } else if (mode === 'bike') {
    personal = 0;
    co2 = 0;
    resourcesUsed = km;
    label = 'Поездка на велосипеде';
    icon = '🚴';
  }

  // Per-passenger分担 — if multiple passengers, personal cost is shared
  if (passengers > 1 && (mode === 'car_gasoline' || mode === 'car_diesel' || mode === 'car_ev')) {
    personal = personal / passengers;
  }

  const environmental = co2 * ECO_COST_PER_KG_CO2;
  const social = co2 * SOCIAL_COST_PER_KG_CO2;
  const trueCost = personal + environmental + social;

  return {
    costs: { personal, environmental, social, trueCost },
    co2Kg: co2,
    resourcesUsed,
    resourceUnit: mode === 'car_ev' ? 'кВт·ч' : mode === 'bus' || mode === 'walk' || mode === 'bike' ? 'км' : 'л',
    label,
    icon,
  };
}

function calcElectricity(input: ActionInput) {
  const kwh = input.kwh ?? 0;
  const source = input.energySource ?? 'grid';

  const personal = kwh * GRID_KWH_PRICE;
  const co2Factor = source === 'grid' ? CO2_PER_KWH_GRID : CO2_PER_KGH_RENEWABLE_OVERRIDE(source);
  const co2 = kwh * co2Factor;
  const environmental = co2 * ECO_COST_PER_KG_CO2;
  const social = co2 * SOCIAL_COST_PER_KG_CO2;
  const trueCost = personal + environmental + social;

  const sourceLabel = source === 'grid' ? 'городская сеть' : source === 'solar' ? 'солнечная' : 'ветровая';

  return {
    costs: { personal, environmental, social, trueCost },
    co2Kg: co2,
    resourcesUsed: kwh,
    resourceUnit: 'кВт·ч',
    label: `Электричество — ${sourceLabel}`,
    icon: '⚡',
  };
}

function CO2_PER_KGH_RENEWABLE_OVERRIDE(source: string): number {
  return source === 'grid' ? CO2_PER_KWH_GRID : CO2_PER_KWH_RENEWABLE;
}

function calcShopping(input: ActionInput) {
  const cost = input.itemCost ?? 0;
  const itemType = input.itemType ?? 'other';
  const isLocal = input.isLocal ?? false;

  // CO₂ based on item type — rough kg CO₂ per 1000 ₸ spent
  const co2Per1000Tenge: Record<string, number> = {
    clothing: 3.5, // textile production + transport
    electronics: 1.8,
    food: 0.8,
    other: 1.2,
  };

  let co2 = (cost / 1000) * (co2Per1000Tenge[itemType] ?? 1.2);

  // Local goods have less transport emissions
  if (isLocal) co2 *= 0.6;

  const environmental = co2 * ECO_COST_PER_KG_CO2;
  const social = co2 * SOCIAL_COST_PER_KG_CO2;
  const trueCost = cost + environmental + social;

  const typeLabel: Record<string, string> = {
    clothing: 'Одежда',
    electronics: 'Электроника',
    food: 'Продукты',
    other: 'Покупка',
  };

  return {
    costs: { personal: cost, environmental, social, trueCost },
    co2Kg: co2,
    resourcesUsed: 1,
    resourceUnit: 'шт',
    label: `Покупка — ${typeLabel[itemType] ?? 'товар'}${isLocal ? ' (локальное)' : ''}`,
    icon: '🛒',
  };
}

// ─── Dashboard metrics ───────────────────────────────────────────────

export function computeDashboardMetrics(actions: ActionResult[]): DashboardMetrics {
  let trueCostTotal = 0;
  let environmentalTotal = 0;
  let co2Total = 0;
  let personalTotal = 0;
  let socialTotal = 0;
  let potentialSavings = 0;

  for (const a of actions) {
    trueCostTotal += a.costs.trueCost;
    environmentalTotal += a.costs.environmental;
    co2Total += a.co2Kg;
    personalTotal += a.costs.personal;
    socialTotal += a.costs.social;
    if (!a.appliedOptimization) {
      potentialSavings += estimateSavings(a);
    }
  }

  // EcoScore: 100 = perfect, 0 = terrible
  // Based on ratio of environmental+social to personal cost
  const overheadRatio = personalTotal > 0 ? (environmentalTotal + socialTotal) / personalTotal : 0;
  // lower overhead = better score. 0 overhead = 100, 0.5 overhead = ~50
  const ecoScore = Math.max(0, Math.min(100, Math.round(100 - overheadRatio * 120)));

  return {
    trueCostTotal,
    environmentalTotal,
    co2Total,
    potentialSavings,
    ecoScore,
    personalTotal,
    socialTotal,
    actionCount: actions.length,
  };
}

function estimateSavings(action: ActionResult): number {
  // Rough estimate: ~25% of true cost could be saved via optimization
  if (action.category === 'transport') {
    return Math.round(action.costs.trueCost * 0.45);
  }
  if (action.category === 'electricity') {
    return Math.round(action.costs.trueCost * 0.2);
  }
  return Math.round(action.costs.trueCost * 0.15);
}

// ─── Impact breakdown ────────────────────────────────────────────────

export function computeImpactBreakdown(actions: ActionResult[]): ImpactBreakdown[] {
  const byCategory: Record<string, { trueCost: number; co2: number }> = {};

  for (const a of actions) {
    if (!byCategory[a.category]) byCategory[a.category] = { trueCost: 0, co2: 0 };
    byCategory[a.category].trueCost += a.costs.trueCost;
    byCategory[a.category].co2 += a.co2Kg;
  }

  const total = Object.values(byCategory).reduce((s, v) => s + v.trueCost, 0);
  const result: ImpactBreakdown[] = [];

  for (const [cat, data] of Object.entries(byCategory)) {
    const meta = CATEGORIES[cat as CategoryId];
    result.push({
      category: cat as CategoryId,
      label: meta.label,
      icon: meta.icon,
      percentage: total > 0 ? Math.round((data.trueCost / total) * 100) : 0,
      trueCost: data.trueCost,
      co2: data.co2,
      color: meta.color,
    });
  }

  return result.sort((a, b) => b.percentage - a.percentage);
}

// ─── Formatting helpers ──────────────────────────────────────────────

export function formatTenge(n: number): string {
  return Math.round(n).toLocaleString('ru-RU') + ' ₸';
}

export function formatNumber(n: number, decimals = 1): string {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatKg(n: number): string {
  if (n < 1) return `${Math.round(n * 1000)} г`;
  return `${formatNumber(n, 1)} кг`;
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'только что';
  if (min < 60) return `${min} мин назад`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ч назад`;
  const days = Math.floor(hr / 24);
  return `${days} дн назад`;
}
