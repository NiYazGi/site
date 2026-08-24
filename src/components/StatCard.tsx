import type { ReactNode } from 'react';
import { useCountUp } from '@/lib/useCountUp';
import { formatTenge, formatKg, formatNumber } from '@/lib/calc';

interface StatCardProps {
  label: string;
  value: number;
  format: 'tenge' | 'kg' | 'number' | 'score';
  icon?: ReactNode;
  accent?: 'primary' | 'eco' | 'warn' | 'danger' | 'info' | 'neutral';
  sublabel?: string;
  delay?: number;
}

const accentMap = {
  primary: { text: 'text-primary-400', glow: 'shadow-primary-500/10', bg: 'bg-primary-500/10', border: 'border-primary-500/20' },
  eco: { text: 'text-eco-400', glow: 'shadow-eco-500/10', bg: 'bg-eco-500/10', border: 'border-eco-500/20' },
  warn: { text: 'text-warn-400', glow: 'shadow-warn-500/10', bg: 'bg-warn-500/10', border: 'border-warn-500/20' },
  danger: { text: 'text-danger-400', glow: 'shadow-danger-500/10', bg: 'bg-danger-500/10', border: 'border-danger-500/20' },
  info: { text: 'text-info-400', glow: 'shadow-info-500/10', bg: 'bg-info-500/10', border: 'border-info-500/20' },
  neutral: { text: 'text-ink-300', glow: 'shadow-ink-500/10', bg: 'bg-white/5', border: 'border-white/10' },
};

export function StatCard({ label, value, format, icon, accent = 'neutral', sublabel, delay = 0 }: StatCardProps) {
  const animated = useCountUp(value);
  const colors = accentMap[accent];

  const formatted = (() => {
    switch (format) {
      case 'tenge':
        return formatTenge(animated);
      case 'kg':
        return formatKg(animated);
      case 'score':
        return `${Math.round(animated)}/100`;
      default:
        return formatNumber(animated, 0);
    }
  })();

  return (
    <div
      className={`glass-card-hover p-5 animate-slide-up ${colors.glow} relative overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-ink-400 font-medium">{label}</span>
          {icon && <span className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text}`}>{icon}</span>}
        </div>
        <div className={`stat-number text-2xl md:text-3xl ${colors.text}`}>{formatted}</div>
        {sublabel && <div className="text-xs text-ink-500 mt-1.5">{sublabel}</div>}
      </div>
    </div>
  );
}

export function EcoScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const animated = useCountUp(score);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;
  const color = score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="stat-number text-2xl text-ink-100">{Math.round(animated)}</span>
        <span className="text-[10px] text-ink-500 uppercase tracking-wider">из 100</span>
      </div>
    </div>
  );
}
