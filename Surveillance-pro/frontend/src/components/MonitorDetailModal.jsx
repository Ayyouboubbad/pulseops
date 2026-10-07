import React, { useEffect, useState } from 'react';
import { X, Activity, Lock, Globe, Clock, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { api } from '../services/api';

export const MonitorDetailModal = ({ monitor, isOpen, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !monitor?._id) return;
    setLoading(true);

    api.getMonitor(monitor._id)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen, monitor]);

  if (!isOpen) return null;

  // Chart data formatting
  const chartData = (data?.heartbeats || []).map((h) => ({
    time: new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    latency: h.responseTimeMs,
    status: h.status
  }));

  const m = data?.monitor || monitor;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              m.status === 'UP' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              m.status === 'DOWN' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
              'bg-slate-800 border-slate-700 text-slate-400'
            }`}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white">{m.name}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${
                  m.status === 'UP' ? 'bg-emerald-500/20 text-emerald-400' :
                  m.status === 'DOWN' ? 'bg-rose-500/20 text-rose-400' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{m.url}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Key Metrics Quick Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dernière Latence</span>
              <span className="text-lg font-bold text-white font-mono">{m.lastLatencyMs || 0} ms</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Dernier Code HTTP</span>
              <span className="text-lg font-bold text-white font-mono">{m.lastStatusCode || '—'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Intervalle de Check</span>
              <span className="text-lg font-bold text-white font-mono">{m.interval}s</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Expiration Certificat</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {m.ssl?.daysRemaining !== undefined && m.ssl?.daysRemaining !== null ? `${m.ssl.daysRemaining} jours` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Latency History Chart (Recharts) */}
          <div className="p-5 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-semibold text-white">Courbe de Latence en Temps Réel (ms)</h4>
              </div>
              <span className="text-xs text-slate-500">60 derniers points de mesure</span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-slate-500 text-sm">
                En attente des premiers pings...
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      unit="ms" 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#818cf8' }}
                      formatter={(val) => [`${val} ms`, 'Latence']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="latency" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#latencyGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* SSL Certificate Details Box */}
          {m.ssl?.valid !== null && m.ssl?.valid !== undefined && (
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 mt-0.5">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1 text-xs space-y-1">
                <div className="font-semibold text-slate-200">Sécurité SSL / TLS</div>
                <div className="text-slate-400">
                  Émetteur : <span className="text-white font-medium">{m.ssl?.issuer || 'Inconnu'}</span>
                </div>
                <div className="text-slate-400">
                  Expire le : <span className="text-white font-medium">{m.ssl?.validTo ? new Date(m.ssl.validTo).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</span> ({m.ssl?.daysRemaining} jours restants)
                </div>
              </div>
            </div>
          )}

          {/* Recent Heartbeat Logs Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Journal Récent des Pings</h4>
            <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5">Horodatage</th>
                    <th className="px-4 py-2.5">Statut</th>
                    <th className="px-4 py-2.5">Code</th>
                    <th className="px-4 py-2.5">Latence</th>
                    <th className="px-4 py-2.5">Message / Erreur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(data?.heartbeats || []).slice(0, 10).map((h, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="px-4 py-2 text-slate-400">{new Date(h.createdAt).toLocaleTimeString()}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.status === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-300">{h.statusCode || '—'}</td>
                      <td className="px-4 py-2 text-slate-300">{h.responseTimeMs} ms</td>
                      <td className="px-4 py-2 text-slate-400 truncate max-w-xs">{h.errorMessage || 'OK'}</td>
                    </tr>
                  ))}
                  {(data?.heartbeats || []).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-4 text-center text-slate-500">
                        Aucun log consigné pour l'instant
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
