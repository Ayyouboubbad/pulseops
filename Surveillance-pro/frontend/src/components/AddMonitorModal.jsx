import React, { useState } from 'react';
import { X, Globe, Clock, Bell, Shield, Send } from 'lucide-react';

export const AddMonitorModal = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    interval: 60,
    timeout: 10000,
    telegramChatId: '',
    discordWebhookUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        url: formData.url.trim(),
        interval: Number(formData.interval),
        timeout: Number(formData.timeout),
        alertConfig: {
          telegram: {
            enabled: Boolean(formData.telegramChatId.trim()),
            chatId: formData.telegramChatId.trim()
          },
          discord: {
            enabled: Boolean(formData.discordWebhookUrl.trim()),
            webhookUrl: formData.discordWebhookUrl.trim()
          }
        }
      };

      await onCreated(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Ajouter une Cible de Surveillance</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nom du Service / Serveur
            </label>
            <input
              type="text"
              required
              placeholder="ex: API Production, Mon Blog, Passerelle Paiement"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              URL Cible (HTTP ou HTTPS)
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com/api/health"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          {/* Interval & Timeout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Fréquence de Vérification
              </label>
              <select
                value={formData.interval}
                onChange={(e) => setFormData({ ...formData, interval: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={10}>Toutes les 10 secondes (Ultra)</option>
                <option value={30}>Toutes les 30 secondes</option>
                <option value={60}>Toutes les 60 secondes (Recommandé)</option>
                <option value={300}>Toutes les 5 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Délai Max (Timeout)
              </label>
              <select
                value={formData.timeout}
                onChange={(e) => setFormData({ ...formData, timeout: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700/80 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value={5000}>5 secondes</option>
                <option value={10000}>10 secondes (Défaut)</option>
                <option value={20000}>20 secondes</option>
              </select>
            </div>
          </div>

          {/* Alerting Channels Accordion/Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Notifications & Alertes (Optionnel)
            </span>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  placeholder="ex: 123456789 (laisser vide pour canal par défaut)"
                  value={formData.telegramChatId}
                  onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Discord Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={formData.discordWebhookUrl}
                  onChange={(e) => setFormData({ ...formData, discordWebhookUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-white placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? 'Création en cours...' : 'Démarrer la Surveillance'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
