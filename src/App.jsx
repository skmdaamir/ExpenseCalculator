import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Users, 
  Layers, 
  GitFork, 
  CheckCircle2, 
  ShoppingBag, 
  PieChart,
  HardDrive,
  Database,
  Coins
} from 'lucide-react';

import { Navbar } from './components/Navbar';
import { EventHeader } from './components/EventHeader';
import { AnalyticsCards } from './components/AnalyticsCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { MoneyFlowGraph } from './components/MoneyFlowGraph';
import { ExpenseTracker } from './components/ExpenseTracker';
import { SettlementView } from './components/SettlementView';

import { TransactionModal } from './components/TransactionModal';
import { ParticipantsModal } from './components/ParticipantsModal';
import { EventListModal } from './components/EventListModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { ReportModal } from './components/ReportModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import { dataService } from './services/dataService';
import { calculateEventFinances } from './utils/settlementEngine';

export function App() {
  const [events, setEvents] = useState([]);
  const [currentEventId, setCurrentEventId] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'expenses', 'flow', 'settle'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isEventListOpen, setIsEventListOpen] = useState(false);
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Initialize theme from system or localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('poolsplit_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('poolsplit_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Load initial events data
  const loadData = async () => {
    setLoading(true);
    try {
      const loadedEvents = await dataService.getEvents();
      setEvents(loadedEvents);
      setIsCloudConnected(dataService.isCloudConnected());
      if (loadedEvents.length > 0 && !currentEventId) {
        setCurrentEventId(loadedEvents[0].id);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Currently selected event
  const currentEvent = useMemo(() => {
    return events.find(e => e.id === currentEventId) || events[0] || null;
  }, [events, currentEventId]);

  // Recalculate settlement engine finances reactively
  const finances = useMemo(() => {
    if (!currentEvent) return null;
    return calculateEventFinances(
      currentEvent.participants || [],
      currentEvent.transactions || []
    );
  }, [currentEvent]);

  // --- Handlers ---
  const handleSelectEvent = (id) => {
    setCurrentEventId(id);
  };

  const handleCreateEvent = async (eventData) => {
    const newEvt = await dataService.createEvent(eventData);
    setEvents(prev => [newEvt, ...prev]);
    setCurrentEventId(newEvt.id);
  };

  const handleUpdateEvent = async (eventId, patch) => {
    await dataService.updateEvent(eventId, patch);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...patch } : e));
  };

  const handleDeleteEvent = async (eventId) => {
    await dataService.deleteEvent(eventId);
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    if (currentEventId === eventId && updated.length > 0) {
      setCurrentEventId(updated[0].id);
    }
  };

  const handleAddParticipant = async (participantData) => {
    if (!currentEvent) return;
    const added = await dataService.addParticipant(currentEvent.id, participantData);
    setEvents(prev => prev.map(evt => {
      if (evt.id === currentEvent.id) {
        return {
          ...evt,
          participants: [...(evt.participants || []), added]
        };
      }
      return evt;
    }));
  };

  const handleUpdateParticipant = async (participantId, patch) => {
    if (!currentEvent) return;
    await dataService.updateParticipant(currentEvent.id, participantId, patch);
    setEvents(prev => prev.map(evt => {
      if (evt.id === currentEvent.id) {
        return {
          ...evt,
          participants: evt.participants.map(p => p.id === participantId ? { ...p, ...patch } : p)
        };
      }
      return evt;
    }));
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!currentEvent) return;
    await dataService.removeParticipant(currentEvent.id, participantId);
    setEvents(prev => prev.map(evt => {
      if (evt.id === currentEvent.id) {
        return {
          ...evt,
          participants: evt.participants.filter(p => p.id !== participantId),
          transactions: evt.transactions.filter(t => t.paid_by_id !== participantId && t.manager_id !== participantId)
        };
      }
      return evt;
    }));
  };

  const handleAddTransaction = async (txData) => {
    if (!currentEvent) return;
    const added = await dataService.addTransaction(currentEvent.id, txData);
    setEvents(prev => prev.map(evt => {
      if (evt.id === currentEvent.id) {
        return {
          ...evt,
          transactions: [added, ...(evt.transactions || [])]
        };
      }
      return evt;
    }));
  };

  const handleDeleteTransaction = async (txId) => {
    if (!currentEvent) return;
    await dataService.deleteTransaction(currentEvent.id, txId);
    setEvents(prev => prev.map(evt => {
      if (evt.id === currentEvent.id) {
        return {
          ...evt,
          transactions: (evt.transactions || []).filter(t => t.id !== txId)
        };
      }
      return evt;
    }));
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all events and transactions to sample demo data?')) {
      const demoEvents = dataService.resetToDemo();
      setEvents(demoEvents);
      setCurrentEventId(demoEvents[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        events={events}
        currentEvent={currentEvent}
        onSelectEvent={handleSelectEvent}
        onOpenNewEvent={() => setIsEventListOpen(true)}
        onOpenEventsList={() => setIsEventListOpen(true)}
        onOpenSupabaseConfig={() => setIsSupabaseConfigOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        isCloudConnected={isCloudConnected}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onResetDemo={handleResetDemo}
      />

      {/* Main Content Area */}
      {currentEvent ? (
        <main className="flex-1 pb-28 md:pb-16">
          
          {/* Event Header Banner & Tab Switcher */}
          <EventHeader
            event={currentEvent}
            participants={currentEvent.participants || []}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onOpenAddTransaction={() => setIsAddTxOpen(true)}
            onOpenParticipants={() => setIsParticipantsOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            
            {/* Always show high-level summary cards */}
            {finances && (
              <AnalyticsCards
                finances={finances}
                currency={currentEvent.currency || 'INR'}
                onSwitchTab={setActiveTab}
              />
            )}

            {/* Tab 1: Overview & Analytics */}
            {activeTab === 'overview' && finances && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <AnalyticsCharts
                  finances={finances}
                  currency={currentEvent.currency || 'INR'}
                />

                {/* Quick Itemized List Preview */}
                <ExpenseTracker
                  event={currentEvent}
                  transactions={currentEvent.transactions || []}
                  participants={currentEvent.participants || []}
                  currency={currentEvent.currency || 'INR'}
                  onOpenAddTransaction={() => setIsAddTxOpen(true)}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </motion.div>
            )}

            {/* Tab 2: Itemized Expenses & Gifts */}
            {activeTab === 'expenses' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ExpenseTracker
                  event={currentEvent}
                  transactions={currentEvent.transactions || []}
                  participants={currentEvent.participants || []}
                  currency={currentEvent.currency || 'INR'}
                  onOpenAddTransaction={() => setIsAddTxOpen(true)}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </motion.div>
            )}

            {/* Tab 3: Interactive Money Flow Graph */}
            {activeTab === 'flow' && finances && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <MoneyFlowGraph
                  event={currentEvent}
                  participants={currentEvent.participants || []}
                  transactions={currentEvent.transactions || []}
                  finances={finances}
                  currency={currentEvent.currency || 'INR'}
                />
              </motion.div>
            )}

            {/* Tab 4: Final Settlement & Debt Simplification */}
            {activeTab === 'settle' && finances && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <SettlementView
                  event={currentEvent}
                  participants={currentEvent.participants || []}
                  finances={finances}
                  currency={currentEvent.currency || 'INR'}
                  onOpenReport={() => setIsReportOpen(true)}
                />
              </motion.div>
            )}

          </div>
        </main>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <div className="w-16 h-16 rounded-3xl bg-brand-500/10 text-brand-600 mx-auto flex items-center justify-center mb-4">
              <Coins className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">No Event Selected</h2>
            <p className="text-sm text-slate-500 mt-1 mb-4">Create your first group pool or load sample trips.</p>
            <button
              onClick={() => setIsEventListOpen(true)}
              className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold"
            >
              Open Trip Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-slate-700 dark:text-slate-300">PoolSplit</strong> • Group Event & Trip Expense Pooling Engine
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupabaseConfigOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              <span>{isCloudConnected ? 'Cloud Supabase' : 'Offline Mode'}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsEventListOpen(true)}
              className="hover:underline flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              <span>Events ({events.length})</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        participants={currentEvent?.participants || []}
        currency={currentEvent?.currency || 'INR'}
        onSave={handleAddTransaction}
      />

      <ParticipantsModal
        isOpen={isParticipantsOpen}
        onClose={() => setIsParticipantsOpen(false)}
        participants={currentEvent?.participants || []}
        onAddParticipant={handleAddParticipant}
        onUpdateParticipant={handleUpdateParticipant}
        onRemoveParticipant={handleRemoveParticipant}
      />

      <EventListModal
        isOpen={isEventListOpen}
        onClose={() => setIsEventListOpen(false)}
        events={events}
        currentEventId={currentEventId}
        onSelectEvent={handleSelectEvent}
        onCreateEvent={handleCreateEvent}
        onUpdateEvent={handleUpdateEvent}
        onDeleteEvent={handleDeleteEvent}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseConfigOpen}
        onClose={() => setIsSupabaseConfigOpen(false)}
        isCloudConnected={isCloudConnected}
        onConfigUpdated={() => {
          setIsCloudConnected(dataService.isCloudConnected());
          loadData();
        }}
      />

      {/* PDF Financial Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        event={currentEvent}
        participants={currentEvent?.participants || []}
        transactions={currentEvent?.transactions || []}
        finances={finances}
        currency={currentEvent?.currency || 'INR'}
      />

      {/* Mobile Bottom Navigation & Quick Add Floating Button */}
      {currentEvent && (
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          transactionCount={currentEvent?.transactions?.length || 0}
          settlementCount={finances?.settlements?.length || 0}
        />
      )}

    </div>
  );
}

export default App;
