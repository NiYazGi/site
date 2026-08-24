import { ArrowLeft, Save, Sparkles, Check, TrendingDown, Cloud, Wallet, Users, Leaf } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatTenge, formatKg, formatNumber } from '@/lib/calc';
import { useCountUp } from '@/lib/useCountUp';

export function Analysis() {
  const { pendingResult, pendingRecommendation, applyRecommendation, saveAction, navigate } = useApp();

  if (!pendingResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="text-ink-500 text-sm">Нет активного анализа</div>
        <button onClick={() => navigate('add-action')} className="btn-primary">
          Добавить действие
        </button>
      </div>
    );
  }

  const result = pendingResult;
  const rec = pendingRecommendation;
  const wasOptimized = result.appliedOptimization;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('add-action')} className="btn-ghost !px-2.5 !py-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-100">
            Анализ действия
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">{result.icon} {result.label}</p>
        </div>
      </div>

      {/* True Cost Hero */}
      <TrueCostHero result={result} wasOptimized={wasOptimized} />

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CostTile
          label="Личная стоимость"
          value={result.costs.personal}
          icon={<Wallet size={16} />}
          accent="info"
          description="Прямые расходы"
        />
        <CostTile
          label="Экологическая стоимость"
          value={result.costs.environmental}
          icon={<Leaf size={16} />}
          accent="eco"
          description="Ущерб природе"
        />
        <CostTile
          label="Социальные издержки"
          value={result.costs.social}
          icon={<Users size={16} />}
          accent="warn"
          description="Последствия для общества"
        />
      </div>

      {/* CO₂ + Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-warn-500/10 border border-warn-500/20 flex items-center justify-center text-warn-400">
            <Cloud size={24} />
          </div>
          <div>
            <div className="text-xs text-ink-500">CO₂ выбросы</div>
            <div className="stat-number text-2xl text-warn-400">{formatKg(result.co2Kg)}</div>
          </div>
        </div>
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-info-500/10 border border-info-500/20 flex items-center justify-center text-info-400">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-xs text-ink-500">Использовано ресурсов</div>
            <div className="stat-number text-2xl text-info-400">
              {formatNumber(result.resourcesUsed, 1)} <span className="text-sm text-ink-500">{result.resourceUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization comparison if applied */}
      {wasOptimized && result.originalCosts && (
        <OptimizationComparison
          originalTrueCost={result.originalCosts.trueCost}
          newTrueCost={result.costs.trueCost}
          originalCo2={result.originalCo2 ?? 0}
          newCo2={result.co2Kg}
        />
      )}

      {/* AI Recommendation */}
      {rec && !wasOptimized && (
        <AIRecommendationPanel
          rec={rec}
          onApply={() => applyRecommendation(result.id)}
        />
      )}

      {rec && wasOptimized && (
        <div className="glass-card p-5 border-eco-500/20 bg-eco-500/[0.03] animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-500/15 flex items-center justify-center text-eco-400">
              <Check size={20} />
            </div>
            <div>
              <div className="font-medium text-ink-100">Рекомендация применена</div>
              <div className="text-sm text-ink-400">
                True Cost снижён до {formatTenge(result.costs.trueCost)}, CO₂ — до {formatKg(result.co2Kg)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex gap-3 sticky bottom-4 lg:relative lg:bottom-0">
        <button onClick={() => navigate('dashboard')} className="btn-secondary flex-1 lg:flex-none">
          Отмена
        </button>
        <button onClick={saveAction} className="btn-primary flex-1">
          <Save size={18} /> Сохранить в историю
        </button>
      </div>
    </div>
  );
}

function TrueCostHero({ result, wasOptimized }: { result: import('@/types').ActionResult; wasOptimized: boolean }) {
  const animatedTrue = useCountUp(result.costs.trueCost);
  const animatedCo2 = useCountUp(result.co2Kg);

  return (
    <div className="relative glass-card p-8 overflow-hidden animate-slide-up">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl opacity-40 -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-info-500/8 rounded-full blur-3xl opacity-30 translate-y-1/3" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs uppercase tracking-widest text-ink-500 font-medium">True Cost</span>
          {wasOptimized && (
            <span className="badge bg-eco-500/10 text-eco-400 border border-eco-500/20">
              <Check size={10} /> оптимизировано
            </span>
          )}
        </div>
        <div className="stat-number text-5xl md:text-6xl gradient-text">
          {formatTenge(animatedTrue)}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-ink-400">
            <Cloud size={16} className="text-warn-400" />
            <span>CO₂: <span className="stat-number text-ink-200">{formatKg(animatedCo2)}</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CostTile({
  label,
  value,
  icon,
  accent,
  description,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: 'info' | 'eco' | 'warn';
  description: string;
}) {
  const animated = useCountUp(value);
  const colors = {
    info: 'text-info-400 bg-info-500/10 border-info-500/20',
    eco: 'text-eco-400 bg-eco-500/10 border-eco-500/20',
    warn: 'text-warn-400 bg-warn-500/10 border-warn-500/20',
  };

  return (
    <div className="glass-card p-5 animate-slide-up">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${colors[accent]}`}>
        {icon}
      </div>
      <div className="text-xs text-ink-500 mb-1">{label}</div>
      <div className={`stat-number text-xl ${colors[accent].split(' ')[0]}`}>{formatTenge(animated)}</div>
      <div className="text-[11px] text-ink-600 mt-1">{description}</div>
    </div>
  );
}

function AIRecommendationPanel({
  rec,
  onApply,
}: {
  rec: import('@/types').Recommendation;
  onApply: () => void;
}) {
  return (
    <div className="relative glass-card p-6 overflow-hidden animate-slide-up border-primary-500/20">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/8 rounded-full blur-3xl opacity-40 -translate-y-1/3 translate-x-1/3" />

      <div className="relative">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles size={20} className="text-ink-950" />
          </div>
          <div>
            <div className="font-display text-lg font-bold text-ink-100">AI рекомендует</div>
            <div className="text-xs text-ink-500">{rec.title}</div>
          </div>
        </div>

        <p className="text-sm text-ink-300 leading-relaxed mb-5">{rec.description}</p>

        {/* Savings summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-3 rounded-xl bg-eco-500/5 border border-eco-500/10">
            <div className="text-xs text-ink-500 mb-1">Экономия</div>
            <div className="stat-number text-lg text-eco-400">{formatTenge(rec.potentialSavings)}</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-warn-500/5 border border-warn-500/10">
            <div className="text-xs text-ink-500 mb-1">CO₂ снижение</div>
            <div className="stat-number text-lg text-warn-400">{rec.co2ReductionPct}%</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-info-500/5 border border-info-500/10">
            <div className="text-xs text-ink-500 mb-1">Новый True Cost</div>
            <div className="stat-number text-lg text-info-400">{formatTenge(rec.newTrueCost)}</div>
          </div>
        </div>

        <button onClick={onApply} className="btn-primary w-full text-base !py-4">
          <TrendingDown size={18} /> Применить рекомендацию
        </button>
      </div>
    </div>
  );
}

function OptimizationComparison({
  originalTrueCost,
  newTrueCost,
  originalCo2,
  newCo2,
}: {
  originalTrueCost: number;
  newTrueCost: number;
  originalCo2: number;
  newCo2: number;
}) {
  const costDelta = originalTrueCost - newTrueCost;
  const co2Delta = originalCo2 - newCo2;
  const co2Pct = originalCo2 > 0 ? Math.round((co2Delta / originalCo2) * 100) : 0;

  return (
    <div className="glass-card p-6 animate-slide-up">
      <div className="text-sm text-ink-400 font-medium mb-4">Сравнение до и после</div>
      <div className="grid grid-cols-2 gap-4">
        <ComparisonColumn
          label="До оптимизации"
          trueCost={originalTrueCost}
          co2={originalCo2}
          accent="warn"
        />
        <ComparisonColumn
          label="После оптимизации"
          trueCost={newTrueCost}
          co2={newCo2}
          accent="eco"
          savings={costDelta}
          co2ReductionPct={co2Pct}
        />
      </div>
    </div>
  );
}

function ComparisonColumn({
  label,
  trueCost,
  co2,
  accent,
  savings,
  co2ReductionPct,
}: {
  label: string;
  trueCost: number;
  co2: number;
  accent: 'warn' | 'eco';
  savings?: number;
  co2ReductionPct?: number;
}) {
  const color = accent === 'eco' ? 'text-eco-400' : 'text-warn-400';
  const bg = accent === 'eco' ? 'bg-eco-500/5 border-eco-500/10' : 'bg-warn-500/5 border-warn-500/10';

  return (
    <div className={`p-4 rounded-xl border ${bg}`}>
      <div className="text-xs text-ink-500 mb-2">{label}</div>
      <div className={`stat-number text-xl ${color}`}>{formatTenge(trueCost)}</div>
      <div className="text-sm text-ink-400 mt-1">CO₂: {formatKg(co2)}</div>
      {savings !== undefined && savings > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="text-xs text-ink-500">Экономия</div>
          <div className="stat-number text-sm text-eco-400">{formatTenge(savings)} · −{co2ReductionPct}% CO₂</div>
        </div>
      )}
    </div>
  );
}
