import React from 'react';
import { 
  Coins, 
  Database, 
  HardDrive, 
  Sun, 
  Moon, 
  RotateCcw, 
  ChevronDown, 
  Plus, 
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';

export const Navbar = ({
  events,
  currentEvent,
  onSelectEvent,
  onOpenNewEvent,
  onOpenEventsList,
  onOpenSupabaseConfig,
  onOpenReport,
  isCloudConnected,
  isDarkMode,
  onToggleDarkMode,
  onResetDemo
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Event Selector */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 flex-shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-brand-600 dark:from-white dark:via-brand-200 dark:to-brand-400 bg-clip-text text-transparent">
                PoolSplit
              </span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">
                Group Trip & Event Pool
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Event Quick Switcher Button */}
          <button
            onClick={onOpenEventsList}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200/70 dark:border-slate-700/70 transition-all text-left max-w-[200px] sm:max-w-[260px] group"
          >
            <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <div className="truncate">
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {currentEvent ? currentEvent.title : 'Select Event'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 ml-auto flex-shrink-0" />
          </button>
        </div>

        {/* Right Actions: Supabase Status, Reset, Theme, New Event */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Database / Local Storage Indicator */}
          <button
            onClick={onOpenSupabaseConfig}
            title={isCloudConnected ? "Connected to Supabase PostgreSQL" : "Using LocalStorage (Click to connect Supabase)"}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          >
            {isCloudConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline text-emerald-600 dark:text-emerald-400 font-semibold">Supabase Cloud</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline text-slate-600 dark:text-slate-300">Local Mode</span>
              </>
            )}
          </button>

          {/* PDF Report Quick Button */}
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              title="Download PDF Financial Report"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF Report</span>
            </button>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            title="Reset to Sample Demo Data"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* New Event Button */}
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onOpenNewEvent}
            className="hidden sm:inline-flex"
          >
            New Trip / Pool
          </Button>
        </div>

      </div>
    </header>
  );
};
