import React from 'react';
import { Server, CheckCircle2, AlertOctagon, Zap, ShieldCheck } from 'lucide-react';

export const MetricsCards = ({ summary }) => {
  const cards = [
    {
      label: 'Cibles Surveillées',
      value: summary?.total ?? 0,
      icon: Server,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    },
    {
      label: 'Services Opérationnels',
      value: summary?.up ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      label: 'Services en Panne',
      value: summary?.down ?? 0,
      icon: AlertOctagon,
      color: summary?.down > 0 ? 'text-rose-400' : 'text-slate-400',
      bgColor: summary?.down > 0 ? 'bg-rose-500/10' : 'bg-slate-800/40',
      borderColor: summary?.down > 0 ? 'border-rose-500/30' : 'border-slate-800'
    },
    {
      label: 'Latence Moyenne',
      value: summary?.avgLatencyMs ? `${summary.avgLatencyMs} ms` : '—',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      label: 'Uptime Global 24h',
      value: summary?.globalUptime24h ? `${summary.globalUptime24h}%` : '100%',
      icon: ShieldCheck,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl bg-slate-900/50 border ${c.borderColor} backdrop-blur-sm flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.bgColor} ${c.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">
              {c.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
