import { Leaf, LayoutDashboard, Plus, History, TrendingUp, Sparkles } from 'lucide-react';
import { useApp, type Screen } from '@/store/AppContext';

const navItems: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add-action', label: 'Добавить действие', icon: Plus },
  { id: 'history', label: 'История', icon: History },
  { id: 'impact', label: 'Мой Impact', icon: TrendingUp },
];

export function Sidebar() {
  const { screen, navigate, metrics } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/5 bg-ink-950/40 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Leaf className="w-5 h-5 text-ink-950" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-lg font-bold text-ink-100 leading-none">EcoFin</div>
              <div className="text-[10px] text-ink-500 uppercase tracking-widest mt-0.5">True Cost</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = screen === item.id || (item.id === 'add-action' && screen === 'analysis');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                    : 'text-ink-400 hover:text-ink-100 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 m-3 glass-card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-400" size={16} />
            <span className="text-xs font-medium text-ink-300">EcoScore</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="stat-number text-2xl text-ink-100">{metrics.ecoScore}</span>
            <span className="text-xs text-ink-500 mb-1">из 100</span>
          </div>
          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${metrics.ecoScore}%`,
                background: metrics.ecoScore >= 70 ? '#34d399' : metrics.ecoScore >= 40 ? '#fbbf24' : '#f87171',
              }}
            />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-ink-950" strokeWidth={2.5} size={18} />
          </div>
          <span className="font-display text-base font-bold">EcoFin</span>
        </div>
        <div className="badge bg-primary-500/10 text-primary-400 border border-primary-500/20">
          EcoScore {metrics.ecoScore}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/5 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = screen === item.id || (item.id === 'add-action' && screen === 'analysis');
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                active ? 'text-primary-400' : 'text-ink-500'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
