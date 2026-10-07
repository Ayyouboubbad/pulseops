const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Global Metrics
  getMetrics: async () => {
    const res = await fetch(`${API_BASE}/metrics/summary`);
    if (!res.ok) throw new Error('Impossible de charger les métriques');
    const data = await res.json();
    return data.data;
  },

  // Monitors
  getMonitors: async () => {
    const res = await fetch(`${API_BASE}/monitors`);
    if (!res.ok) throw new Error('Impossible de charger les moniteurs');
    const data = await res.json();
    return data.data;
  },

  getMonitor: async (id) => {
    const res = await fetch(`${API_BASE}/monitors/${id}`);
    if (!res.ok) throw new Error('Impossible de charger le détail du moniteur');
    const data = await res.json();
    return data.data;
  },

  createMonitor: async (payload) => {
    const res = await fetch(`${API_BASE}/monitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la création');
    }
    return await res.json();
  },

  deleteMonitor: async (id) => {
    const res = await fetch(`${API_BASE}/monitors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Erreur lors de la suppression');
    return await res.json();
  },

  pauseMonitor: async (id) => {
    const res = await fetch(`${API_BASE}/monitors/${id}/pause`, { method: 'POST' });
    if (!res.ok) throw new Error('Erreur lors de la mise en pause');
    return await res.json();
  },

  resumeMonitor: async (id) => {
    const res = await fetch(`${API_BASE}/monitors/${id}/resume`, { method: 'POST' });
    if (!res.ok) throw new Error('Erreur lors de la reprise');
    return await res.json();
  },

  triggerCheckNow: async (id) => {
    const res = await fetch(`${API_BASE}/monitors/${id}/check-now`, { method: 'POST' });
    if (!res.ok) throw new Error('Erreur lors du déclenchement du check');
    return await res.json();
  }
};
