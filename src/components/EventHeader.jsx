import React from 'react';
import { 
  Users, 
  Plus, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  PieChart, 
  Receipt, 
  GitFork, 
  CheckCircle2, 
  Share2,
  Tag
} from 'lucide-react';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { formatDate } from '../utils/formatters';

export const EventHeader = ({
  event,
  participants = [],
  activeTab,
  onTabChange,
  onOpenAddTransaction,
  onOpenParticipants,
  onOpenShare
}) => {
  if (!event) return null;

  const managers = participants.filter(p => p.is_manager);
  const managerNames = managers.map(m => m.name).join(', ') || 'No Manager Assigned';

  const tabs = [
    { id: 'overview', label: 'Overview & Analytics', icon: PieChart },
    { id: 'expenses', label: 'Itemized Expenses', icon: Receipt },
    { id: 'flow', label: 'Money Flow Graph', icon: GitFork, isSpecial: true },
    { id: 'settle', label: 'Settlement & Payouts', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-gradient-to-b from-brand-50/50 via-slate-50 to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950 pt-6 pb-2 border-b border-slate-200/60 dark:border-slate-800/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={event.category === 'wedding_gift' ? 'purple' : 'brand'} size="sm">
                <Tag className="w-3 h-3 mr-1" />
                {event.category === 'wedding_gift' ? 'Wedding Gift Pool' : event.category === 'trip' ? 'Trip Pool' : 'Event Pool'}
              </Badge>
              {event.status === 'archived' && (
                <Badge variant="warning" size="sm">Archived</Badge>
              )}
              {event.created_at && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.created_at)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {event.title}
            </h1>
            {event.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
                {event.description}
              </p>
            )}

            {/* Manager info & Participants preview */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Pool Manager: {managerNames}</span>
              </div>

              <button
                onClick={onOpenParticipants}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{participants.length} Friends & Contributors</span>
                <span className="underline ml-0.5 text-[11px] text-brand-600 dark:text-brand-400">Manage</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <Button
              variant="secondary"
              size="md"
              icon={Users}
              onClick={onOpenParticipants}
              className="text-xs sm:text-sm"
            >
              Friends ({participants.length})
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Plus}
              onClick={onOpenAddTransaction}
              className="text-xs sm:text-sm shadow-md shadow-brand-500/25"
            >
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-b border-transparent pt-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isSpecial && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                    Visual
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
