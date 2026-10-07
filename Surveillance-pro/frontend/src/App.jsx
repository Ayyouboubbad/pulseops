import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { MonitorCard } from './components/MonitorCard';
import { AddMonitorModal } from './components/AddMonitorModal';
import { MonitorDetailModal } from './components/MonitorDetailModal';
import { api } from './services/api';
import { Search, Filter, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function App() {
  const [metrics, setMetrics] = useState(null);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, UP, DOWN, PAUSED
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async (showSpin = false) => {
    if (showSpin) setIsRefreshing(true);
    try {
      const [metricsData, monitorsData] = await Promise.all([
        api.getMetrics().catch(() => null),
        api.getMonitors().catch(() => [])
      ]);

      if (metricsData) setMetrics(metricsData.summary);
      if (monitorsData) setMonitors(monitorsData);
    } catch (err) {
      console.error('Erreur chargement données:', err);
    } finally {
      setLoading(false);
      if (showSpin) setIsRefreshing(false);
    }
  }, []);

  // Initial load + intervalle auto-polling toutes les 10 secondes
  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Actions Handlers
  const handleCreateMonitor = async (payload) => {
    await api.createMonitor(payload);
    showNotification('Cible ajoutée et surveillance démarrée !');
    loadData(false);
  };

  const handleCheckNow = async (id) => {
    setCheckingId(id);
    try {
      await api.triggerCheckNow(id);
      showNotification('Check immédiat envoyé au Worker !');
      setTimeout(() => loadData(false), 1500);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setTimeout(() => setCheckingId(null), 1000);
    }
  };

  const handleTogglePause = async (monitor) => {
    try {
      if (monitor.status === 'PAUSED') {
        await api.resumeMonitor(monitor._id);
        showNotification(`Surveillance reprise pour ${monitor.name}`);
      } else {
        await api.pauseMonitor(monitor._id);
        showNotification(`Surveillance en pause pour ${monitor.name}`);
      }
      loadData(false);
      // Rafraîchir après 2 secondes pour capturer le résultat du check immédiat du worker
      setTimeout(() => loadData(false), 2000);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteMonitor = async (id, name) => {
    if (!window.confirm(`Confirmez-vous la suppression définitive du moniteur "${name}" ?`)) return;
    try {
      await api.deleteMonitor(id);
      showNotification(`Moniteur "${name}" supprimé`);
      loadData(false);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Filtered monitors list
  const filteredMonitors = monitors.filter((m) => {
    const matchesFilter = filter === 'ALL' || m.status === filter;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.url.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const hasIncidents = (metrics?.down || 0) > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-in slide-in-from-bottom duration-200 ${
          notification.type === 'error'
            ? 'bg-rose-950 border-rose-800 text-rose-200'
            : 'bg-emerald-950 border-emerald-800 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <ShieldAlert className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        onAddClick={() => setIsAddModalOpen(true)}
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        hasIncidents={hasIncidents}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* KPI Summary Cards */}
        <MetricsCards summary={metrics} />

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
          
          {/* Status Filter Buttons */}
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'UP', 'DOWN', 'PAUSED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors ${
                  filter === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tab === 'ALL' ? 'Tous' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer par nom ou URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

        </div>

        {/* Monitors Cards Grid / List */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            Chargement des sondes de surveillance...
          </div>
        ) : filteredMonitors.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-800 rounded-2xl p-8 bg-slate-900/20">
            <p className="text-slate-400 font-medium">Aucun moniteur ne correspond à vos critères.</p>
            <p className="text-xs text-slate-600 mt-1">Cliquez sur "Nouveau Moniteur" pour commencer à surveiller une URL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredMonitors.map((monitor) => (
              <MonitorCard
                key={monitor._id}
                monitor={monitor}
                onViewDetails={setSelectedMonitor}
                onCheckNow={handleCheckNow}
                onTogglePause={handleTogglePause}
                onDelete={handleDeleteMonitor}
                isChecking={checkingId === monitor._id}
              />
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        PulseOps Platform • Distributed Uptime & Monitoring • Mode Pair Programming DevOps
      </footer>

      {/* Add Monitor Modal */}
      <AddMonitorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreateMonitor}
      />

      {/* Detail & History Modal */}
      <MonitorDetailModal
        monitor={selectedMonitor}
        isOpen={Boolean(selectedMonitor)}
        onClose={() => setSelectedMonitor(null)}
      />

    </div>
  );
}

export default App;
