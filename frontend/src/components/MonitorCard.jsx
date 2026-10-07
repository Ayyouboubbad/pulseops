import React from 'react';
import { 
  Globe, 
  Clock, 
  Zap, 
  Lock, 
  ExternalLink, 
  Pause, 
  Play, 
  Trash2, 
  LineChart, 
  AlertTriangle 
} from 'lucide-react';

export const MonitorCard = ({
  monitor,
  onViewDetails,
  onCheckNow,
  onTogglePause,
  onDelete,
  isChecking
}) => {
  const isUp = monitor.status === 'UP';
  const isDown = monitor.status === 'DOWN';
  const isPaused = monitor.status === 'PAUSED';

  // Format date relative
  const formatTime = (dateStr) => {
    if (!dateStr) return 'En attente';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `il y a ${diff}s`;
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`;
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`p-5 rounded-xl border transition-all duration-200 backdrop-blur-sm ${
      isDown 
        ? 'bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20' 
        : isPaused
        ? 'bg-slate-900/40 border-slate-800 opacity-75'
        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80 shadow-md'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Status Icon, Name & URL */}
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="mt-1">
            {isUp && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
            {isDown && (
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
              </span>
            )}
            {isPaused && <span className="inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>}
            {!isUp && !isDown && !isPaused && (
              <span className="inline-flex rounded-full h-3.5 w-3.5 bg-slate-500"></span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-white truncate text-base">{monitor.name}</h3>
              <a
                href={monitor.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">{monitor.url}</p>
          </div>
        </div>

        {/* Center / Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          
          {/* Status Badge */}
          <div className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
            isUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            isDown ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
            isPaused ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>
            {monitor.status}
          </div>

          {/* Latency Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-mono text-slate-200">
              {monitor.lastLatencyMs ? `${monitor.lastLatencyMs}ms` : '—'}
            </span>
          </div>

          {/* SSL Badge */}
          {monitor.ssl?.daysRemaining !== null && monitor.ssl?.daysRemaining !== undefined && (
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs border ${
              monitor.ssl.daysRemaining > 14
                ? 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`} title={`Émetteur: ${monitor.ssl?.issuer || 'N/A'}`}>
              <Lock className="h-3 w-3 text-indigo-400" />
              <span>SSL: {monitor.ssl.daysRemaining}j</span>
            </div>
          )}

          {/* Uptime 24h */}
          <div className="hidden lg:flex flex-col items-end text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-medium">Uptime 24h</span>
            <span className="font-semibold text-emerald-400 font-mono">
              {monitor.uptime24h !== undefined ? `${monitor.uptime24h}%` : '100%'}
            </span>
          </div>

        </div>

        {/* Right / Actions */}
        <div className="flex items-center space-x-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 justify-end">
          
          {/* Check Now */}
          <button
            onClick={() => onCheckNow(monitor._id)}
            disabled={isChecking}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60 disabled:opacity-50"
            title="Exécuter un check immédiat"
          >
            <Zap className={`h-4 w-4 ${isChecking ? 'animate-bounce text-amber-400' : ''}`} />
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => onTogglePause(monitor)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
            title={isPaused ? "Reprendre la surveillance" : "Mettre en pause"}
          >
            {isPaused ? <Play className="h-4 w-4 text-emerald-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
          </button>

          {/* View Details / Charts */}
          <button
            onClick={() => onViewDetails(monitor)}
            className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-colors"
            title="Voir graphiques et historique"
          >
            <LineChart className="h-4 w-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(monitor._id, monitor.name)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors border border-slate-700/60 hover:border-rose-800/50"
            title="Supprimer le moniteur"
          >
            <Trash2 className="h-4 w-4" />
          </button>

        </div>

      </div>

      {/* Footer Info / Interval & Last Check */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>Intervalle: <b>{monitor.interval}s</b></span>
        </div>
        <div>
          Dernier ping: <span className="text-slate-400">{formatTime(monitor.lastCheck)}</span>
        </div>
      </div>

    </div>
  );
};
