import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { ALL_CATEGORIES, TRANSPORT_MODES } from '@/lib/calc';
import type { CategoryId, TransportMode, ActionInput } from '@/types';

export function AddAction() {
  const { navigate, calculateAndAnalyze } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);

  if (selectedCategory) {
    return (
      <ActionForm
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onSubmit={(input) => calculateAndAnalyze(input)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={() => navigate('dashboard')} className="btn-ghost !px-2.5 !py-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-ink-100">Добавить действие</h1>
          <p className="text-ink-400 text-sm mt-1">Выберите категорию для анализа True Cost</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            disabled={!cat.enabled}
            onClick={() => cat.enabled && setSelectedCategory(cat.id as CategoryId)}
            className={`group relative p-5 rounded-2xl border transition-all text-left ${
              cat.enabled
                ? 'glass-card-hover hover:scale-[1.02] cursor-pointer'
                : 'glass-card opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{cat.icon}</span>
              {!cat.enabled && (
                <span className="badge bg-white/5 text-ink-500">
                  <Lock size={10} /> скоро
                </span>
              )}
            </div>
            <div className="font-medium text-ink-100 text-sm">{cat.label}</div>
            {cat.enabled && (
              <div className="flex items-center gap-1 mt-3 text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Анализировать <ArrowRight size={12} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionForm({
  category,
  onBack,
  onSubmit,
}: {
  category: CategoryId;
  onBack: () => void;
  onSubmit: (input: ActionInput) => void;
}) {
  if (category === 'transport') return <TransportForm onBack={onBack} onSubmit={onSubmit} />;
  if (category === 'electricity') return <ElectricityForm onBack={onBack} onSubmit={onSubmit} />;
  return <ShoppingForm onBack={onBack} onSubmit={onSubmit} />;
}

// ─── Transport Form ──────────────────────────────────────────────────

function TransportForm({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (input: ActionInput) => void;
}) {
  const [distance, setDistance] = useState(15);
  const [mode, setMode] = useState<TransportMode>('car_gasoline');
  const [passengers, setPassengers] = useState(1);
  const [duration, setDuration] = useState(30);

  return (
    <FormShell title="🚗 Транспорт — Поездка" subtitle="Введите параметры поездки" onBack={onBack}>
      <Field label="Тип транспорта">
        <div className="grid grid-cols-3 gap-2">
          {TRANSPORT_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as TransportMode)}
              className={`p-3 rounded-xl border text-center transition-all ${
                mode === m.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-ink-100'
                  : 'bg-white/[0.03] border-white/5 text-ink-400 hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-xl mb-1">{m.icon}</div>
              <div className="text-[11px] font-medium">{m.label}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Расстояние" unit="км">
        <RangeSlider value={distance} min={0.5} max={100} step={0.5} onChange={setDistance} />
      </Field>

      <Field label="Пассажиры" unit="чел">
        <RangeSlider value={passengers} min={1} max={5} step={1} onChange={setPassengers} />
      </Field>

      <Field label="Время в пути" unit="мин">
        <RangeSlider value={duration} min={5} max={120} step={5} onChange={setDuration} />
      </Field>

      <SubmitButton onSubmit={() => onSubmit({ category: 'transport', distanceKm: distance, transportMode: mode, passengers, durationMin: duration })} />
    </FormShell>
  );
}

// ─── Electricity Form ────────────────────────────────────────────────

function ElectricityForm({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (input: ActionInput) => void;
}) {
  const [kwh, setKwh] = useState(100);
  const [source, setSource] = useState<'grid' | 'solar' | 'wind'>('grid');

  return (
    <FormShell title="⚡ Электроэнергия" subtitle="Введите параметры потребления" onBack={onBack}>
      <Field label="Потребление" unit="кВт·ч">
        <RangeSlider value={kwh} min={10} max={500} step={10} onChange={setKwh} />
      </Field>

      <Field label="Источник энергии">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'grid', label: 'Сеть', icon: '🔌' },
            { id: 'solar', label: 'Солнце', icon: '☀️' },
            { id: 'wind', label: 'Ветер', icon: '💨' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSource(s.id as typeof source)}
              className={`p-3 rounded-xl border text-center transition-all ${
                source === s.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-ink-100'
                  : 'bg-white/[0.03] border-white/5 text-ink-400 hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-[11px] font-medium">{s.label}</div>
            </button>
          ))}
        </div>
      </Field>

      <SubmitButton onSubmit={() => onSubmit({ category: 'electricity', kwh, energySource: source })} />
    </FormShell>
  );
}

// ─── Shopping Form ───────────────────────────────────────────────────

function ShoppingForm({
  onBack,
  onSubmit,
}: {
  onBack: () => void;
  onSubmit: (input: ActionInput) => void;
}) {
  const [cost, setCost] = useState(3000);
  const [itemType, setItemType] = useState<'clothing' | 'electronics' | 'food' | 'other'>('clothing');
  const [isLocal, setIsLocal] = useState(false);

  return (
    <FormShell title="🛒 Покупки" subtitle="Введите параметры покупки" onBack={onBack}>
      <Field label="Стоимость товара" unit="₸">
        <RangeSlider value={cost} min={500} max={50000} step={500} onChange={setCost} />
      </Field>

      <Field label="Тип товара">
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'clothing', label: 'Одежда', icon: '👕' },
            { id: 'electronics', label: 'Электроника', icon: '📱' },
            { id: 'food', label: 'Продукты', icon: '🥫' },
            { id: 'other', label: 'Другое', icon: '📦' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setItemType(t.id as typeof itemType)}
              className={`p-3 rounded-xl border text-center transition-all ${
                itemType === t.id
                  ? 'bg-primary-500/10 border-primary-500/30 text-ink-100'
                  : 'bg-white/[0.03] border-white/5 text-ink-400 hover:bg-white/[0.06]'
              }`}
            >
              <div className="text-xl mb-1">{t.icon}</div>
              <div className="text-[11px] font-medium">{t.label}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Локальный товар?">
        <button
          onClick={() => setIsLocal(!isLocal)}
          className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
            isLocal
              ? 'bg-eco-500/10 border-eco-500/30 text-ink-100'
              : 'bg-white/[0.03] border-white/5 text-ink-400'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{isLocal ? '✅' : '🌍'}</span>
            <div>
              <div className="text-sm font-medium">{isLocal ? 'Локальный товар' : 'Импортный товар'}</div>
              <div className="text-xs text-ink-500">
                {isLocal ? 'Меньше транспортных выбросов' : 'Доставка из-за рубежа'}
              </div>
            </div>
          </div>
        </button>
      </Field>

      <SubmitButton
        onSubmit={() => onSubmit({ category: 'shopping', itemCost: cost, itemType, isLocal })}
      />
    </FormShell>
  );
}

// ─── Shared form components ──────────────────────────────────────────

function FormShell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack} className="btn-ghost !px-2.5 !py-2.5">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-100">{title}</h1>
          <p className="text-ink-400 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-6">{children}</div>
    </div>
  );
}

function Field({ label, unit, children }: { label: string; unit?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="text-sm font-medium text-ink-300">{label}</label>
        {unit && <span className="text-xs text-ink-500">{unit}</span>}
      </div>
      {children}
    </div>
  );
}

function RangeSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-primary-500 h-2"
        />
        <span className="stat-number text-lg text-primary-400 ml-4 min-w-[60px] text-right">
          {value.toLocaleString('ru-RU')}
        </span>
      </div>
    </div>
  );
}

function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  return (
    <button onClick={onSubmit} className="btn-primary w-full text-base !py-4">
      Рассчитать True Cost
      <ArrowRight size={18} />
    </button>
  );
}
