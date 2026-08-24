import { Wallet, Leaf, Cloud, TrendingDown, Plus, Sparkles, ArrowRight, History as HistoryIcon, BarChart3 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { StatCard, EcoScoreRing } from '@/components/StatCard';
import { formatTenge, formatKg, timeAgo, CATEGORIES } from '@/lib/calc';
import { generateInsights } from '@/lib/ai';
import type { CategoryId } from '@/types';

export function Dashboard() {
  const { metrics, actions, navigate, impactBreakdown } = useApp();
  const insights = generateInsights(actions);
  const recentActions = actions.slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pt-2">
        <div>
          <div className="text-sm text-ink-500 font-medium mb-1">Главная аналитика</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-100">
            True Cost <span className="gradient-text">аналитика</span>
          </h1>
          <p className="text-ink-400 text-sm mt-2 max-w-lg">
            Реальная стоимость ваших действий — личные + экологические + социальные издержки
          </p>
        </div>
        <button onClick={() => navigate('add-action')} className="btn-primary shrink-0">
          <Plus size={18} /> Анализировать действие
        </button>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="True Cost за месяц"
          value={metrics.trueCostTotal}
          format="tenge"
          icon={<Wallet size={16} />}
          accent="primary"
          sublabel={`${metrics.actionCount} действий`}
          delay={0}
        />
        <StatCard
          label="Экологический ущерб"
          value={metrics.environmentalTotal}
          format="tenge"
          icon={<Leaf size={16} />}
          accent="eco"
          sublabel="часть True Cost"
          delay={80}
        />
        <StatCard
          label="CO₂ выбросы"
          value={metrics.co2Total}
          format="kg"
          icon={<Cloud size={16} />}
          accent="warn"
          sublabel="углеродный след"
          delay={160}
        />
        <StatCard
          label="Экономия при оптимизации"
          value={metrics.potentialSavings}
          format="tenge"
          icon={<TrendingDown size={16} />}
          accent="info"
          sublabel="потенциал снижения"
          delay={240}
        />
      </div>

      {/* EcoScore + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* EcoScore */}
        <div className="glass-card p-6 flex flex-col items-center justify-center animate-slide-up animate-delay-300">
          <div className="text-sm text-ink-400 font-medium mb-4">Ваш EcoScore</div>
          <EcoScoreRing score={metrics.ecoScore} size={130} />
          <div className="mt-4 text-center">
            <div className="text-xs text-ink-500">
              {metrics.ecoScore >= 70
                ? 'Отличный баланс расходов и воздействия'
                : metrics.ecoScore >= 40
                ? 'Есть пространство для оптимизации'
                : 'Высокая нагрузка — нужен анализ'}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6 animate-slide-up animate-delay-500">
          <div className="text-sm text-ink-400 font-medium mb-4">Быстрые действия</div>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('add-action')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-ink-100">Анализировать действие</div>
                  <div className="text-xs text-ink-500">Рассчитать True Cost</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink-600 group-hover:text-ink-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('history')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-info-500/10 text-info-400 flex items-center justify-center">
                  <HistoryIcon size={18} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-ink-100">Мои действия</div>
                  <div className="text-xs text-ink-500">{actions.length} записей</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink-600 group-hover:text-ink-400 transition-colors" />
            </button>

            <button
              onClick={() => navigate('impact')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-warn-500/10 text-warn-400 flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-ink-100">Мой Impact</div>
                  <div className="text-xs text-ink-500">Графики и анализ</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink-600 group-hover:text-ink-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <div className="glass-card p-6 animate-slide-up animate-delay-500">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-primary-400" />
            <span className="text-sm text-ink-400 font-medium">AI инсайты</span>
          </div>
          {insights.length === 0 ? (
            <div className="text-sm text-ink-500 py-4">
              Добавьте больше действий, чтобы AI мог проанализировать ваши показатели.
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    insight.severity === 'critical'
                      ? 'bg-danger-500/5 border-danger-500/15 text-ink-300'
                      : insight.severity === 'warning'
                      ? 'bg-warn-500/5 border-warn-500/15 text-ink-300'
                      : 'bg-eco-500/5 border-eco-500/15 text-ink-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-base shrink-0">{insight.icon}</span>
                    <span>{insight.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* True Cost Breakdown + Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Cost Breakdown */}
        <div className="glass-card p-6 lg:col-span-2 animate-slide-up animate-delay-300">
          <div className="text-sm text-ink-400 font-medium mb-5">Структура True Cost</div>
          <CostBreakdownChart
            personal={metrics.personalTotal}
            environmental={metrics.environmentalTotal}
            social={metrics.socialTotal}
          />
        </div>

        {/* Recent Actions */}
        <div className="glass-card p-6 lg:col-span-3 animate-slide-up animate-delay-300">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-ink-400 font-medium">Последние действия</div>
            <button onClick={() => navigate('history')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Вся история →
            </button>
          </div>
          {recentActions.length === 0 ? (
            <div className="text-sm text-ink-500 py-8 text-center">Пока нет действий</div>
          ) : (
            <div className="space-y-2">
              {recentActions.map((action) => {
                const meta = CATEGORIES[action.category as CategoryId];
                return (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-all cursor-pointer"
                    onClick={() => navigate('history')}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-base"
                        style={{ backgroundColor: `${meta?.color}15` }}
                      >
                        {action.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-100 truncate">{action.label}</div>
                        <div className="text-xs text-ink-500">{timeAgo(action.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <div className="stat-number text-sm text-ink-100">{formatTenge(action.costs.trueCost)}</div>
                      {action.appliedOptimization && (
                        <div className="badge bg-eco-500/10 text-eco-400 mt-0.5">оптимизировано</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Impact preview */}
      {impactBreakdown.length > 0 && (
        <div className="glass-card p-6 animate-slide-up animate-delay-500">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-ink-400 font-medium">Где вы создаёте наибольший ущерб</div>
            <button onClick={() => navigate('impact')} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Подробнее →
            </button>
          </div>
          <div className="space-y-3">
            {impactBreakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ink-200">
                    {item.icon} {item.label}
                  </span>
                  <span className="stat-number text-sm text-ink-400">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostBreakdownChart({
  personal,
  environmental,
  social,
}: {
  personal: number;
  environmental: number;
  social: number;
}) {
  const total = personal + environmental + social;
  const personalPct = total > 0 ? (personal / total) * 100 : 0;
  const ecoPct = total > 0 ? (environmental / total) * 100 : 0;
  const socialPct = total > 0 ? (social / total) * 100 : 0;

  const segments = [
    { label: 'Личная стоимость', value: personal, pct: personalPct, color: '#3b82f6' },
    { label: 'Экологическая стоимость', value: environmental, pct: ecoPct, color: '#10b981' },
    { label: 'Социальные издержки', value: social, pct: socialPct, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-white/5">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="h-full transition-all duration-700"
            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
            title={seg.label}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-2.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="text-sm text-ink-300">{seg.label}</span>
            </div>
            <div className="text-right">
              <span className="stat-number text-sm text-ink-100">{formatTenge(seg.value)}</span>
              <span className="text-xs text-ink-500 ml-1.5">{Math.round(seg.pct)}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-400 font-medium">Итого True Cost</span>
          <span className="stat-number text-lg text-primary-400">{formatTenge(total)}</span>
        </div>
      </div>
    </div>
  );
}
