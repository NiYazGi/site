import { useState } from 'react';
import { ArrowLeft, X, Sparkles, Check, Cloud, Wallet, Users, Leaf, TrendingDown } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatTenge, formatKg, formatNumber, timeAgo, CATEGORIES } from '@/lib/calc';
import { generateRecommendation } from '@/lib/ai';
import type { ActionResult, CategoryId } from '@/types';

export function History() {
  const { actions, navigate, applyRecommendation } = useApp();
  const [selected, setSelected] = useState<ActionResult | null>(null);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('dashboard')} className="btn-ghost !px-2.5 !py-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-100">История действий</h1>
          <p className="text-ink-400 text-sm mt-0.5">{actions.length} записей</p>
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-ink-500 text-sm mb-4">Пока нет действий</div>
          <button onClick={() => navigate('add-action')} className="btn-primary">
            Добавить первое действие
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actions.map((action, i) => {
            const meta = CATEGORIES[action.category as CategoryId];
            return (
              <div
                key={action.id}
                onClick={() => setSelected(action)}
                className="glass-card-hover p-4 cursor-pointer flex items-center justify-between group animate-slide-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: `${meta?.color}15` }}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-ink-100 truncate">{action.label}</div>
                    <div className="text-xs text-ink-500 flex items-center gap-2 mt-0.5">
                      {timeAgo(action.timestamp)}
                      {action.appliedOptimization && (
                        <span className="badge bg-eco-500/10 text-eco-400">оптимизировано</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="stat-number text-base text-ink-100">{formatTenge(action.costs.trueCost)}</div>
                  <div className="text-xs text-ink-500">{formatKg(action.co2Kg)} CO₂</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <ActionDetail
          action={selected}
          onClose={() => setSelected(null)}
          onApply={(id) => {
            applyRecommendation(id);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function ActionDetail({
  action,
  onClose,
  onApply,
}: {
  action: ActionResult;
  onClose: () => void;
  onApply: (id: string) => void;
}) {
  const rec = generateRecommendation(action);
  const meta = CATEGORIES[action.category as CategoryId];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-card w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl animate-slide-up">
        {/* Handle bar for mobile */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${meta?.color}15` }}
              >
                {action.icon}
              </div>
              <div>
                <div className="font-medium text-ink-100">{action.label}</div>
                <div className="text-xs text-ink-500">{timeAgo(action.timestamp)}</div>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost !p-2">
              <X size={18} />
            </button>
          </div>

          {/* True Cost */}
          <div className="p-5 rounded-xl bg-primary-500/[0.03] border border-primary-500/10">
            <div className="text-xs uppercase tracking-widest text-ink-500 mb-1">True Cost</div>
            <div className="stat-number text-3xl gradient-text">{formatTenge(action.costs.trueCost)}</div>
          </div>

          {/* Breakdown */}
          <div className="space-y-2.5">
            <DetailRow icon={<Wallet size={14} />} label="Личная стоимость" value={formatTenge(action.costs.personal)} color="text-info-400" />
            <DetailRow icon={<Leaf size={14} />} label="Экологическая стоимость" value={formatTenge(action.costs.environmental)} color="text-eco-400" />
            <DetailRow icon={<Users size={14} />} label="Социальные издержки" value={formatTenge(action.costs.social)} color="text-warn-400" />
            <div className="h-px bg-white/5 my-1" />
            <DetailRow icon={<Cloud size={14} />} label="CO₂ выбросы" value={formatKg(action.co2Kg)} color="text-warn-400" />
            <DetailRow
              icon={<Sparkles size={14} />}
              label="Ресурсы"
              value={`${formatNumber(action.resourcesUsed, 1)} ${action.resourceUnit}`}
              color="text-info-400"
            />
          </div>

          {/* Optimization comparison */}
          {action.appliedOptimization && action.originalCosts && (
            <div className="p-4 rounded-xl bg-eco-500/5 border border-eco-500/10">
              <div className="flex items-center gap-2 mb-2">
                <Check size={14} className="text-eco-400" />
                <span className="text-sm font-medium text-eco-400">Рекомендация применена</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-ink-500">Было</div>
                  <div className="stat-number text-ink-300">{formatTenge(action.originalCosts.trueCost)}</div>
                  <div className="text-ink-600">{formatKg(action.originalCo2 ?? 0)} CO₂</div>
                </div>
                <div>
                  <div className="text-ink-500">Стало</div>
                  <div className="stat-number text-eco-400">{formatTenge(action.costs.trueCost)}</div>
                  <div className="text-eco-400/70">{formatKg(action.co2Kg)} CO₂</div>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          {rec && !action.appliedOptimization && rec.potentialSavings > 0 && (
            <div className="p-4 rounded-xl bg-primary-500/[0.04] border border-primary-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary-400" />
                <span className="text-sm font-medium text-primary-400">AI рекомендация</span>
              </div>
              <p className="text-xs text-ink-300 leading-relaxed mb-3">{rec.description}</p>
              <button onClick={() => onApply(action.id)} className="btn-primary w-full !py-3 text-sm">
                <TrendingDown size={16} /> Применить — сэкономить {formatTenge(rec.potentialSavings)}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-sm text-ink-400">
        <span className={color}>{icon}</span>
        {label}
      </div>
      <span className={`stat-number text-sm ${color}`}>{value}</span>
    </div>
  );
}
