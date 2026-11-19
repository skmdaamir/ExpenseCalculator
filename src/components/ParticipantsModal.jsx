import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  UserPlus, 
  Sparkles,
  Info
} from 'lucide-react';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';

const AVATAR_COLORS = [
  '#0d9488', '#2563eb', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#06b6d4', '#e11d48'
];

export const ParticipantsModal = ({
  isOpen,
  onClose,
  participants = [],
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant
}) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a participant name.');
      return;
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    onAddParticipant({
      name: name.trim(),
      upi_id: upiId.trim(),
      is_manager: isManager,
      color: randomColor
    });

    setName('');
    setUpiId('');
    setIsManager(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Friends & Pool Managers"
      subtitle="Assign roles, add members, and update UPI IDs for settlements"
      maxWidth="max-w-xl"
    >
      <div className="space-y-6">
        
        {/* Manager Explainer Callout */}
        <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <span className="font-bold">Pool Manager Role:</span> Designated friend(s) who physically collect the UPI/cash deposits from other friends and pay for shared villas, bookings, or registry gifts. The calculation engine automatically balances any unspent pool cash remaining in their hands!
          </div>
        </div>

        {/* Existing Participants List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Current Members ({participants.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {participants.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs"
                    style={{ backgroundColor: p.color || '#0d9488' }}
                  >
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </span>
                      {p.is_manager && (
                        <Badge variant="manager" size="sm">Manager</Badge>
                      )}
                    </div>
                    {p.upi_id && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        UPI: {p.upi_id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle Manager Role Button */}
                  <button
                    type="button"
                    onClick={() => onUpdateParticipant(p.id, { is_manager: !p.is_manager })}
                    title={p.is_manager ? "Revoke Manager Role" : "Make Pool Manager"}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                      p.is_manager
                        ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{p.is_manager ? 'Manager' : 'Make Mgr'}</span>
                  </button>

                  {/* Remove Participant */}
                  {participants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Participant Form */}
        <form onSubmit={handleAdd} className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Add New Member
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Sneha Kapoor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                UPI ID (Optional for Quick Pay)
              </label>
              <input
                type="text"
                placeholder="e.g., sneha@okicici"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isManager}
                onChange={(e) => setIsManager(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Designate as Pool Manager (holds pool cash)
              </span>
            </label>

            <Button size="sm" variant="primary" type="submit" icon={UserPlus}>
              Add Friend
            </Button>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          )}
        </form>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </Modal>
  );
};
