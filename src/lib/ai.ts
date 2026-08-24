import type { ActionResult, Recommendation, ActionInput } from '@/types';
import { calculateAction, CATEGORIES } from './calc';

/**
 * AI recommendation engine.
 * Analyzes an action and generates a personalized, actionable alternative
 * that saves money AND reduces environmental impact.
 */
export function generateRecommendation(action: ActionResult): Recommendation | null {
  switch (action.category) {
    case 'transport':
      return transportRecommendation(action);
    case 'electricity':
      return electricityRecommendation(action);
    case 'shopping':
      return shoppingRecommendation(action);
    default:
      return null;
  }
}

function transportRecommendation(action: ActionResult): Recommendation | null {
  const input = action.input;
  const mode = input.transportMode ?? 'car_gasoline';
  const km = input.distanceKm ?? 0;
  const passengers = input.passengers ?? 1;

  // If already walking/biking — no improvement needed
  if (mode === 'walk' || mode === 'bike') {
    return {
      id: `rec-${action.id}`,
      actionId: action.id,
      title: 'Идеальный выбор',
      description:
        'Вы уже выбрали самый экологичный и бесплатный способ передвижения. Нулевые выбросы, нулевые расходы — это эталон True Cost.',
      alternativeLabel: 'Пешком / велосипед',
      potentialSavings: 0,
      co2ReductionPct: 0,
      co2ReductionKg: 0,
      newTrueCost: action.costs.trueCost,
      newCo2: action.co2Kg,
      applied: false,
    };
  }

  // If already bus — suggest carpooling or bike for short distances
  if (mode === 'bus') {
    if (km <= 3) {
      const altInput: ActionInput = { ...input, transportMode: 'walk' };
      const alt = calculateAction(altInput);
      return buildRec(
        action,
        alt,
        'Прогулка вместо автобуса',
        `Для короткой поездки (${km} км) прогулка пешком — бесплатна и полезна для здоровья. Вы сэкономите на проезде и не создадите никаких выбросов.`,
        'Пешком'
      );
    }
    return null; // bus is already quite good
  }

  // Car → suggest public transport or EV
  if (mode === 'car_gasoline' || mode === 'car_diesel') {
    // For shorter distances, suggest bus
    const altInput: ActionInput = { ...input, transportMode: 'bus', passengers: 1 };
    const alt = calculateAction(altInput);
    const savings = action.costs.trueCost - alt.costs.trueCost;
    const co2Pct = action.co2Kg > 0 ? Math.round(((action.co2Kg - alt.co2Kg) / action.co2Kg) * 100) : 0;

    if (savings > 0) {
      return {
        id: `rec-${action.id}`,
        actionId: action.id,
        title: 'Общественный транспорт',
        description: `Если заменить эту поездку на общественный транспорт, вы сэкономите ${Math.round(savings).toLocaleString('ru-RU')} ₸ и сократите выбросы на ${co2Pct}%. Автобус распределяет выбросы между всеми пассажирами, снижая индивидуальный углеродный след.`,
        alternativeLabel: 'Автобус',
        potentialSavings: Math.round(savings),
        co2ReductionPct: co2Pct,
        co2ReductionKg: Math.round((action.co2Kg - alt.co2Kg) * 10) / 10,
        newTrueCost: alt.costs.trueCost,
        newCo2: alt.co2Kg,
        applied: false,
      };
    }
  }

  // Car → suggest EV for longer term
  if (mode === 'car_gasoline' || mode === 'car_diesel') {
    const altInput: ActionInput = { ...input, transportMode: 'car_ev' };
    const alt = calculateAction(altInput);
    const savings = action.costs.trueCost - alt.costs.trueCost;
    if (savings > 0) {
      return {
        id: `rec-${action.id}`,
        actionId: action.id,
        title: 'Электромобиль',
        description: `Электромобиль дешевле в эксплуатации и производит меньше выбросов. Для этой поездки экономия составит ${Math.round(savings).toLocaleString('ru-RU')} ₸ при снижении выбросов CO₂.`,
        alternativeLabel: 'Электромобиль',
        potentialSavings: Math.round(savings),
        co2ReductionPct: action.co2Kg > 0 ? Math.round(((action.co2Kg - alt.co2Kg) / action.co2Kg) * 100) : 0,
        co2ReductionKg: Math.round((action.co2Kg - alt.co2Kg) * 10) / 10,
        newTrueCost: alt.costs.trueCost,
        newCo2: alt.co2Kg,
        applied: false,
      };
    }
  }

  return null;
}

function electricityRecommendation(action: ActionResult): Recommendation | null {
  const input = action.input;
  const source = input.energySource ?? 'grid';

  if (source !== 'grid') {
    return {
      id: `rec-${action.id}`,
      actionId: action.id,
      title: 'Возобновляемая энергия',
      description:
        'Вы уже используете возобновляемый источник энергии. Ваш углеродный след от электричества минимален — это отличный выбор для окружающей среды.',
      alternativeLabel: 'Возобновляемая',
      potentialSavings: 0,
      co2ReductionPct: 0,
      co2ReductionKg: 0,
      newTrueCost: action.costs.trueCost,
      newCo2: action.co2Kg,
      applied: false,
    };
  }

  // Suggest renewable energy
  const altInput: ActionInput = { ...input, energySource: 'solar' };
  const alt = calculateAction(altInput);
  const savings = action.costs.trueCost - alt.costs.trueCost;
  const co2Pct = action.co2Kg > 0 ? Math.round(((action.co2Kg - alt.co2Kg) / action.co2Kg) * 100) : 0;

  return {
    id: `rec-${action.id}`,
    actionId: action.id,
    title: 'Переход на солнечную энергию',
    description: `Если переключить это потребление на солнечную энергию, вы снизите выбросы CO₂ на ${co2Pct}% и уменьшите True Cost на ${Math.round(savings).toLocaleString('ru-RU')} ₸. Возобновляемые источники практически не производят углеродных выбросов.`,
    alternativeLabel: 'Солнечная энергия',
    potentialSavings: Math.round(savings),
    co2ReductionPct: co2Pct,
    co2ReductionKg: Math.round((action.co2Kg - alt.co2Kg) * 10) / 10,
    newTrueCost: alt.costs.trueCost,
    newCo2: alt.co2Kg,
    applied: false,
  };
}

function shoppingRecommendation(action: ActionResult): Recommendation | null {
  const input = action.input;
  const isLocal = input.isLocal ?? false;

  if (isLocal) {
    return {
      id: `rec-${action.id}`,
      actionId: action.id,
      title: 'Локальная покупка',
      description:
        'Вы выбрали локальный товар — это уже снижает транспортные выбросы. Локальные производства уменьшают углеродный след доставки и поддерживают местную экономику.',
      alternativeLabel: 'Локальный товар',
      potentialSavings: 0,
      co2ReductionPct: 0,
      co2ReductionKg: 0,
      newTrueCost: action.costs.trueCost,
      newCo2: action.co2Kg,
      applied: false,
    };
  }

  // Suggest buying local
  const altInput: ActionInput = { ...input, isLocal: true };
  const alt = calculateAction(altInput);
  const savings = action.costs.trueCost - alt.costs.trueCost;
  const co2Pct = action.co2Kg > 0 ? Math.round(((action.co2Kg - alt.co2Kg) / action.co2Kg) * 100) : 0;

  return {
    id: `rec-${action.id}`,
    actionId: action.id,
    title: 'Выбрать локальный товар',
    description: `Если купить локальный аналог, вы сократите транспортные выбросы на ${co2Pct}% и сэкономите ${Math.round(savings).toLocaleString('ru-RU')} ₸ на True Cost. Локальные товары не требуют межконтинентальной доставки.`,
    alternativeLabel: 'Локальный товар',
    potentialSavings: Math.round(savings),
    co2ReductionPct: co2Pct,
    co2ReductionKg: Math.round((action.co2Kg - alt.co2Kg) * 10) / 10,
    newTrueCost: alt.costs.trueCost,
    newCo2: alt.co2Kg,
    applied: false,
  };
}

function buildRec(
  action: ActionResult,
  alt: ReturnType<typeof calculateAction>,
  title: string,
  description: string,
  altLabel: string
): Recommendation {
  const savings = action.costs.trueCost - alt.costs.trueCost;
  return {
    id: `rec-${action.id}`,
    actionId: action.id,
    title,
    description,
    alternativeLabel: altLabel,
    potentialSavings: Math.round(savings),
    co2ReductionPct: action.co2Kg > 0 ? Math.round(((action.co2Kg - alt.co2Kg) / action.co2Kg) * 100) : 0,
    co2ReductionKg: Math.round((action.co2Kg - alt.co2Kg) * 10) / 10,
    newTrueCost: alt.costs.trueCost,
    newCo2: alt.co2Kg,
    applied: false,
  };
}

// ─── AI insights for dashboard ───────────────────────────────────────

export interface AIInsight {
  category: string;
  message: string;
  severity: 'good' | 'warning' | 'critical';
  icon: string;
}

export function generateInsights(actions: ActionResult[]): AIInsight[] {
  if (actions.length === 0) return [];

  const insights: AIInsight[] = [];
  const byCategory: Record<string, { co2: number; trueCost: number; count: number }> = {};

  for (const a of actions) {
    if (!byCategory[a.category]) byCategory[a.category] = { co2: 0, trueCost: 0, count: 0 };
    byCategory[a.category].co2 += a.co2Kg;
    byCategory[a.category].trueCost += a.costs.trueCost;
    byCategory[a.category].count++;
  }

  const totalCo2 = Object.values(byCategory).reduce((s, v) => s + v.co2, 0);
  const totalTrueCost = Object.values(byCategory).reduce((s, v) => s + v.trueCost, 0);

  // Find worst category by CO₂
  const sortedByCo2 = Object.entries(byCategory).sort(([, a], [, b]) => b.co2 - a.co2);
  if (sortedByCo2.length > 0) {
    const [topCat, topData] = sortedByCo2[0];
    const meta = CATEGORIES[topCat as keyof typeof CATEGORIES];
    const co2Share = totalCo2 > 0 ? Math.round((topData.co2 / totalCo2) * 100) : 0;
    if (co2Share > 35) {
      insights.push({
        category: meta.label,
        message: `${meta.label} — ваш главный источник выбросов CO₂ (${co2Share}% от общего объёма). Оптимизация этой категории даст наибольший эффект.`,
        severity: co2Share > 50 ? 'critical' : 'warning',
        icon: meta.icon,
      });
    }
  }

  // Find most expensive category
  const sortedByCost = Object.entries(byCategory).sort(([, a], [, b]) => b.trueCost - a.trueCost);
  if (sortedByCost.length > 0 && sortedByCost.length > 1) {
    const [topCat, topData] = sortedByCost[0];
    const meta = CATEGORIES[topCat as keyof typeof CATEGORIES];
    const costShare = totalTrueCost > 0 ? Math.round((topData.trueCost / totalTrueCost) * 100) : 0;
    if (costShare > 40) {
      insights.push({
        category: meta.label,
        message: `${meta.label} составляет ${costShare}% вашего True Cost. Здесь наибольший потенциал для финансовой экономии.`,
        severity: 'warning',
        icon: '💰',
      });
    }
  }

  // Good insight if applied optimizations
  const appliedCount = actions.filter((a) => a.appliedOptimization).length;
  if (appliedCount > 0) {
    insights.push({
      category: 'Оптимизация',
      message: `Вы применили ${appliedCount} ${appliedCount === 1 ? 'рекомендацию' : 'рекомендаций'} AI. Это уже снижает ваш углеродный след и расходы.`,
      severity: 'good',
      icon: '✅',
    });
  }

  return insights;
}
