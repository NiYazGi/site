import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { ActionResult, Recommendation, ActionInput, DashboardMetrics, ImpactBreakdown } from '@/types';
import { calculateAction, computeDashboardMetrics, computeImpactBreakdown } from '@/lib/calc';
import { generateRecommendation } from '@/lib/ai';

// Derive an optimized ActionInput from a recommendation (e.g. switch transport mode to bus)
function getOptimizedInput(input: ActionInput, rec: Recommendation): ActionInput {
  if (rec.alternativeLabel === 'Автобус') return { ...input, transportMode: 'bus', passengers: 1 };
  if (rec.alternativeLabel === 'Электромобиль') return { ...input, transportMode: 'car_ev' };
  if (rec.alternativeLabel === 'Пешком / велосипед' || rec.alternativeLabel === 'Пешком') return { ...input, transportMode: 'walk' };
  if (rec.alternativeLabel === 'Солнечная энергия') return { ...input, energySource: 'solar' };
  if (rec.alternativeLabel === 'Локальный товар') return { ...input, isLocal: true };
  return input;
}

export type Screen = 'dashboard' | 'add-action' | 'analysis' | 'history' | 'impact';

interface AppState {
  // Navigation
  screen: Screen;
  navigate: (screen: Screen) => void;

  // Data
  actions: ActionResult[];
  pendingResult: ActionResult | null;
  pendingRecommendation: Recommendation | null;

  // Actions
  calculateAndAnalyze: (input: ActionInput) => void;
  saveAction: () => void;
  applyRecommendation: (actionId: string) => void;
  dismissRecommendation: () => void;

  // Computed
  metrics: DashboardMetrics;
  impactBreakdown: ImpactBreakdown[];
}

const AppContext = createContext<AppState | null>(null);

// Seed demo data so the dashboard isn't empty on first load
function createSeedActions(): ActionResult[] {
  const now = Date.now();
  const seeds: ActionInput[] = [
    { category: 'transport', distanceKm: 18, transportMode: 'car_gasoline', passengers: 1, durationMin: 35 },
    { category: 'transport', distanceKm: 8, transportMode: 'car_gasoline', passengers: 2, durationMin: 20 },
    { category: 'electricity', kwh: 150, energySource: 'grid' },
    { category: 'shopping', itemCost: 4500, itemType: 'clothing', isLocal: false },
    { category: 'transport', distanceKm: 12, transportMode: 'bus', passengers: 1, durationMin: 40 },
    { category: 'electricity', kwh: 90, energySource: 'grid' },
  ];

  return seeds.map((input, i) => {
    const calc = calculateAction(input);
    return {
      id: `seed-${i}`,
      category: input.category,
      label: calc.label,
      icon: calc.icon,
      timestamp: now - (seeds.length - i) * 3600000 * 5,
      input,
      costs: calc.costs,
      co2Kg: calc.co2Kg,
      resourcesUsed: calc.resourcesUsed,
      resourceUnit: calc.resourceUnit,
      appliedOptimization: false,
    };
  });
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [actions, setActions] = useState<ActionResult[]>(() => createSeedActions());
  const [pendingResult, setPendingResult] = useState<ActionResult | null>(null);
  const [pendingRecommendation, setPendingRecommendation] = useState<Recommendation | null>(null);

  const navigate = useCallback((s: Screen) => setScreen(s), []);

  const calculateAndAnalyze = useCallback((input: ActionInput) => {
    const calc = calculateAction(input);
    const result: ActionResult = {
      id: `action-${Date.now()}`,
      category: input.category,
      label: calc.label,
      icon: calc.icon,
      timestamp: Date.now(),
      input,
      costs: calc.costs,
      co2Kg: calc.co2Kg,
      resourcesUsed: calc.resourcesUsed,
      resourceUnit: calc.resourceUnit,
      appliedOptimization: false,
    };

    const rec = generateRecommendation(result);

    setPendingResult(result);
    setPendingRecommendation(rec);
    setScreen('analysis');
  }, []);

  const saveAction = useCallback(() => {
    if (!pendingResult) return;
    setActions((prev) => [pendingResult, ...prev]);
    setPendingResult(null);
    setPendingRecommendation(null);
    setScreen('dashboard');
  }, [pendingResult]);

  const applyRecommendation = useCallback(
    (actionId: string) => {
      // If it's the pending result (not yet saved), apply to pending
      if (pendingResult && pendingResult.id === actionId && pendingRecommendation) {
        const originalCosts = { ...pendingResult.costs };
        const originalCo2 = pendingResult.co2Kg;

        // Reconstruct optimized input from recommendation
        const optimizedInput = getOptimizedInput(pendingResult.input, pendingRecommendation);
        const recalc = calculateAction(optimizedInput);

        setPendingResult({
          ...pendingResult,
          input: optimizedInput,
          label: recalc.label,
          icon: recalc.icon,
          costs: recalc.costs,
          co2Kg: recalc.co2Kg,
          resourcesUsed: recalc.resourcesUsed,
          resourceUnit: recalc.resourceUnit,
          appliedOptimization: true,
          originalCosts,
          originalCo2,
        });
        setPendingRecommendation({ ...pendingRecommendation, applied: true });
        return;
      }

      // If it's a saved action, find and update it
      setActions((prev) =>
        prev.map((a) => {
          if (a.id !== actionId || a.appliedOptimization) return a;
          const rec = generateRecommendation(a);
          if (!rec) return a;
          const optimizedInput = getOptimizedInput(a.input, rec);
          const recalc = calculateAction(optimizedInput);
          return {
            ...a,
            input: optimizedInput,
            label: recalc.label,
            icon: recalc.icon,
            originalCosts: { ...a.costs },
            originalCo2: a.co2Kg,
            costs: recalc.costs,
            co2Kg: recalc.co2Kg,
            resourcesUsed: recalc.resourcesUsed,
            resourceUnit: recalc.resourceUnit,
            appliedOptimization: true,
          };
        })
      );
    },
    [pendingResult, pendingRecommendation]
  );

  const dismissRecommendation = useCallback(() => {
    setPendingRecommendation(null);
  }, []);

  const metrics = useMemo(() => computeDashboardMetrics(actions), [actions]);
  const impactBreakdown = useMemo(() => computeImpactBreakdown(actions), [actions]);

  const value: AppState = {
    screen,
    navigate,
    actions,
    pendingResult,
    pendingRecommendation,
    calculateAndAnalyze,
    saveAction,
    applyRecommendation,
    dismissRecommendation,
    metrics,
    impactBreakdown,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
