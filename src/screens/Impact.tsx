import { useMemo } from 'react';
import { ArrowLeft, Wallet, Leaf, Cloud, Droplets, Trash2, TrendingDown, Sparkles } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatTenge, formatKg, CATEGORIES } from '@/lib/calc';
import { generateInsights } from '@/lib/ai';
import type { CategoryId, ActionResult } from '@/types';

export function Impact() {
  const { actions, navigate, metrics, impactBreakdown } = useApp();
  const insights = generateInsights(actions);

  // Build a time series for the last N actions (cumulative true cost)
  const timeSeries = useMemo(() => {
    const sorted = [...actions].sort((a, b) => a.timestamp - b.timestamp);
    let cumulative = 0;
    let cumulativeCo2 = 0;
    return sorted.map((a) => {
      cumulative += a.costs.trueCost;
      cumulativeCo2 += a.co2Kg;
      return { label: a.label, trueCost: cumulative, co2: cumulativeCo2, icon: a.icon };
    });
  }, [actions]);

  // Resources & waste metrics
  const totalResources = actions.reduce((s, a) => s + a.resourcesUsed, 0);
  const totalWaste = actions
    .filter((a) => a.category === 'shopping')
    .reduce((s) => s + 1, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('dashboard')} className="btn-ghost !px-2.5 !py-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-100">Мой Impact</h1>
          <p className="text-ink-400 text-sm mt-0.5">Графики и анализ воздействия</p>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <ImpactTile icon={<Wallet size={16} />} label="Расходы" value={formatTenge(metrics.trueCostTotal)} accent="text-info-400 bg-info-500/10 border-info-500/20" />
        <ImpactTile icon={<Leaf size={16} />} label="Эко-ущерб" value={formatTenge(metrics.environmentalTotal)} accent="text-eco-400 bg-eco-500/10 border-eco-500/20" />
        <ImpactTile icon={<Cloud size={16} />} label="CO₂" value={formatKg(metrics.co2Total)} accent="text-warn-400 bg-warn-500/10 border-warn-500/20" />
        <ImpactTile icon={<Droplets size={16} />} label="Ресурсы" value={totalResources.toFixed(0)} accent="text-info-400 bg-info-500/10 border-info-500/20" />
        <ImpactTile icon={<Trash2 size={16} />} label="Покупки" value={`${totalWaste} шт`} accent="text-danger-400 bg-danger-500/10 border-danger-500/20" />
      </div>

      {/* Where you create the most damage */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="text-sm text-ink-400 font-medium mb-5">Где вы создаёте наибольший ущерб</div>
        {impactBreakdown.length === 0 ? (
          <div className="text-sm text-ink-500 py-6 text-center">Нет данных для анализа</div>
        ) : (
          <div className="space-y-4">
            {impactBreakdown.map((item, i) => (
              <div key={item.category} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-ink-200">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-500">{formatKg(item.co2)} CO₂</span>
                    <span className="stat-number text-sm" style={{ color: item.color }}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* True Cost trend chart */}
      {timeSeries.length > 0 && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="text-sm text-ink-400 font-medium mb-5">Динамика True Cost</div>
          <TrendChart data={timeSeries} />
        </div>
      )}

      {/* CO₂ by category — bar chart */}
      {impactBreakdown.length > 0 && (
        <div className="glass-card p-6 animate-slide-up">
          <div className="text-sm text-ink-400 font-medium mb-5">CO₂ по категориям</div>
          <div className="space-y-3">
            {impactBreakdown.map((item) => {
              const maxCo2 = Math.max(...impactBreakdown.map((b) => b.co2), 1);
              const widthPct = (item.co2 / maxCo2) * 100;
              return (
                <div key={item.category} className="flex items-center gap-3">
                  <span className="text-sm text-ink-300 w-28 shrink-0">
                    {item.icon} {item.label}
                  </span>
                  <div className="flex-1 h-7 bg-white/5 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(widthPct, 8)}%`, backgroundColor: `${item.color}40`, borderColor: item.color }}
                    >
                      <span className="stat-number text-xs text-ink-100">{formatKg(item.co2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI insights */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-primary-400" />
          <span className="text-sm text-ink-400 font-medium">AI анализ воздействия</span>
        </div>
        {insights.length === 0 ? (
          <div className="text-sm text-ink-500">Добавьте больше действий для анализа.</div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border text-sm leading-relaxed ${
                  insight.severity === 'critical'
                    ? 'bg-danger-500/5 border-danger-500/15'
                    : insight.severity === 'warning'
                    ? 'bg-warn-500/5 border-warn-500/15'
                    : 'bg-eco-500/5 border-eco-500/15'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-lg shrink-0">{insight.icon}</span>
                  <span className="text-ink-300">{insight.message}</span>
                </div>
              </div>
            ))}

            {/* Potential savings callout */}
            {metrics.potentialSavings > 0 && (
              <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/15 flex items-center gap-3">
                <TrendingDown size={20} className="text-primary-400 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-ink-100">
                    Потенциальная экономия: {formatTenge(metrics.potentialSavings)}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    Примените AI-рекомендации, чтобы снизить True Cost и углеродный след
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ImpactTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="glass-card p-4">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mb-2.5 ${accent}`}>{icon}</div>
      <div className="text-xs text-ink-500 mb-0.5">{label}</div>
      <div className="stat-number text-sm text-ink-100">{value}</div>
    </div>
  );
}

function TrendChart({ data }: { data: { label: string; trueCost: number; co2: number; icon: string }[] }) {
  if (data.length < 2) {
    return <div className="text-sm text-ink-500 py-6 text-center">Недостаточно данных для графика</div>;
  }

  const maxCost = Math.max(...data.map((d) => d.trueCost), 1);
  const chartHeight = 200;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = chartHeight - (d.trueCost / maxCost) * (chartHeight - 20) - 10;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L 100 ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 100 ${chartHeight}`} className="w-full" preserveAspectRatio="none" style={{ height: chartHeight }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#trendGradient)" />
        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="#10b981" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 overflow-x-auto gap-2">
        {points.map((p, i) => (
          <div key={i} className="text-[10px] text-ink-600 shrink-0 text-center" style={{ width: 60 }}>
            <div className="text-base">{p.icon}</div>
            <div className="stat-number text-ink-400">{Math.round(p.trueCost).toLocaleString('ru-RU')}₸</div>
          </div>
        ))}
      </div>
    </div>
  );
}
