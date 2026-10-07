import React from 'react';
import { Activity, Plus, RefreshCw, Radio } from 'lucide-react';

export const Header = ({ onAddClick, onRefresh, isRefreshing, hasIncidents }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">Pulse<span className="text-indigo-400">Ops</span></span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                v1.0 DevOps
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Distributed Uptime & Health Infrastructure</p>
          </div>
        </div>

        {/* Global Live Status Badge & Actions */}
        <div className="flex items-center space-x-3">
          <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            hasIncidents
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            <span className={`h-2 w-2 rounded-full ${hasIncidents ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            <span>{hasIncidents ? 'Incident En Cours' : 'Systèmes Opérationnels'}</span>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors border border-slate-700/50 disabled:opacity-50"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Moniteur</span>
          </button>
        </div>

      </div>
    </header>
  );
};
