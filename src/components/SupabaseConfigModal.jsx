import React, { useState } from 'react';
import { 
  Database, 
  HardDrive, 
  Check, 
  ExternalLink, 
  Key, 
  Globe, 
  AlertCircle,
  Copy,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { getSupabaseConfig, saveSupabaseConfig } from '../services/supabaseClient';

export const SupabaseConfigModal = ({
  isOpen,
  onClose,
  isCloudConnected,
  onConfigUpdated
}) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [key, setKey] = useState(currentConfig.key || '');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');

    if (!url.trim() || !key.trim()) {
      setErrorMsg('Please enter both Supabase URL and Anon Key.');
      return;
    }

    if (!url.startsWith('https://')) {
      setErrorMsg('Supabase URL must start with https://');
      return;
    }

    setLoading(true);
    try {
      saveSupabaseConfig(url.trim(), key.trim());
      setStatusMsg('Configuration saved! Reconnecting to Supabase Cloud...');
      setTimeout(() => {
        setLoading(false);
        onConfigUpdated();
        onClose();
      }, 800);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to save configuration: ' + err.message);
    }
  };

  const handleClear = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setKey('');
    setStatusMsg('Switched to LocalStorage Mode.');
    setTimeout(() => {
      onConfigUpdated();
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cloud Database Setup (Supabase)"
      subtitle="Permanent multi-device synchronization via Free Tier PostgreSQL"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        
        {/* Current Status Pill */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between ${
          isCloudConnected
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isCloudConnected ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {isCloudConnected ? <Database className="w-5 h-5" /> : <HardDrive className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                Current Storage Engine
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {isCloudConnected ? 'Supabase PostgreSQL (Cloud Active)' : 'LocalStorage Offline Fallback (Active)'}
              </span>
            </div>
          </div>

          <Badge variant={isCloudConnected ? 'success' : 'warning'}>
            {isCloudConnected ? 'Connected' : 'Offline Mode'}
          </Badge>
        </div>

        {/* Explainer */}
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
          <p>
            The application is designed to be <strong>100% functional out-of-the-box</strong> using browser LocalStorage.
          </p>
          <p>
            To enable permanent cloud storage across multiple devices and friends, create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a>, paste the provided <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-brand-600">schema.sql</code> into your Supabase SQL Editor, and enter your credentials below.
          </p>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="https://your-project-id.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon / Public Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          </div>

          {statusMsg && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{statusMsg}</p>
          )}
          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</p>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {isCloudConnected ? (
              <Button size="sm" variant="outline" type="button" onClick={handleClear}>
                Disconnect & Use LocalStorage
              </Button>
            ) : (
              <span className="text-[11px] text-slate-400">LocalStorage saves all changes automatically.</span>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" type="button" onClick={onClose}>
                Close
              </Button>
              <Button size="sm" variant="primary" type="submit" loading={loading}>
                Connect Supabase
              </Button>
            </div>
          </div>
        </form>

      </div>
    </Modal>
  );
};
