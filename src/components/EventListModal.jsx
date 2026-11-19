import React, { useState } from 'react';
import { 
  Plus, 
  Archive, 
  RotateCcw, 
  Trash2, 
  Check, 
  Layers, 
  Calendar, 
  Tag, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { formatDate } from '../utils/formatters';

export const EventListModal = ({
  isOpen,
  onClose,
  events = [],
  currentEventId,
  onSelectEvent,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'archived'
  
  // New event form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('trip');
  const [currency, setCurrency] = useState('INR');
  const [managerName, setManagerName] = useState('You (Manager)');
  const [managerUpi, setManagerUpi] = useState('');
  const [error, setError] = useState('');

  const filteredEvents = events.filter(evt => {
    if (filter === 'active') return evt.status !== 'archived';
    if (filter === 'archived') return evt.status === 'archived';
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide an event title.');
      return;
    }

    onCreateEvent({
      title: title.trim(),
      description: description.trim(),
      category,
      currency,
      participants: [
        {
          id: `p-mgr-${Date.now()}`,
          name: managerName.trim() || 'You (Manager)',
          is_manager: true,
          upi_id: managerUpi.trim(),
          color: '#2563eb'
        }
      ]
    });

    // Reset and close creation form
    setTitle('');
    setDescription('');
    setCategory('trip');
    setIsCreating(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCreating ? "Create New Trip or Pool" : "All Trips & Event Pools"}
      subtitle={isCreating ? "Set up a new trip or collaborative gift registry" : "Switch between active events or revisit archived trips"}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        
        {!isCreating ? (
          <>
            {/* Header controls: Tabs + Create Button */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  All ({events.length})
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`px-3 py-1 rounded-lg transition-all ${filter === 'active' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('archived')}
                  className={`px-3 py-1 rounded-lg transition-all ${filter === 'archived' ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Archived
                </button>
              </div>

              <Button
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => setIsCreating(true)}
              >
                New Pool
              </Button>
            </div>

            {/* Events List */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No events found in this view.
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const isSelected = evt.id === currentEventId;

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-1 ring-brand-500'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="flex-1 cursor-pointer min-w-0"
                          onClick={() => {
                            onSelectEvent(evt.id);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={evt.category === 'wedding_gift' ? 'purple' : 'brand'}
                              size="sm"
                            >
                              {evt.category === 'wedding_gift' ? 'Wedding Gift' : evt.category === 'trip' ? 'Trip Pool' : 'Event Pool'}
                            </Badge>

                            {evt.status === 'archived' && (
                              <Badge variant="warning" size="sm">Archived</Badge>
                            )}

                            {isSelected && (
                              <Badge variant="success" size="sm">Active View</Badge>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {evt.title}
                          </h4>

                          {evt.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {evt.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                            <span>{evt.participants?.length || 0} Members</span>
                            <span>•</span>
                            <span>{evt.transactions?.length || 0} Transactions</span>
                            {evt.created_at && (
                              <>
                                <span>•</span>
                                <span>{formatDate(evt.created_at)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Archive/Unarchive */}
                          <button
                            type="button"
                            onClick={() => onUpdateEvent(evt.id, {
                              status: evt.status === 'archived' ? 'active' : 'archived'
                            })}
                            title={evt.status === 'archived' ? "Restore to Active" : "Archive Event"}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {evt.status === 'archived' ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                          </button>

                          {/* Delete Event (if more than 1) */}
                          {events.length > 1 && (
                            <button
                              type="button"
                              onClick={() => onDeleteEvent(evt.id)}
                              title="Delete Event"
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* New Event Creation Form */
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Event / Trip Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Manali Road Trip 2026, Rohit’s Wedding Registry Pool"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="Brief summary or trip plan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="trip">Group Trip / Vacation</option>
                  <option value="wedding_gift">Wedding Gift Registry Pool</option>
                  <option value="party">Party / Dinner Celebration</option>
                  <option value="collab">Collaborative Project</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2">
                Initial Pool Manager
              </h5>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Manager Name (e.g. Rohan)"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Manager UPI ID (e.g. rohan@upi)"
                  value={managerUpi}
                  onChange={(e) => setManagerUpi(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {error && <p className="text-xs text-rose-600">{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Create Event
              </Button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
};
