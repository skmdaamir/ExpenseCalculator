import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitFork, 
  ArrowRight, 
  Coins, 
  Wallet, 
  Layers, 
  Sparkles, 
  UserCheck, 
  ShieldCheck, 
  Info,
  Maximize2,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Badge } from './UI/Badge';
import { Button } from './UI/Button';
import { formatCurrency, round2 } from '../utils/formatters';

export const MoneyFlowGraph = ({
  event,
  participants = [],
  transactions = [],
  finances,
  currency = 'INR'
}) => {
  const [activeFlowMode, setActiveFlowMode] = useState('pool'); // 'pool' or 'settlement'
  const [hoveredNode, setHoveredNode] = useState(null);

  const {
    totalPoolCollected = 0,
    remainingPoolCash = 0,
    settlements = [],
    flowGraph
  } = finances || {};

  const manager = participants.find(p => p.is_manager) || participants[0];
  const friends = participants.filter(p => p.id !== manager?.id);

  // Group pool deposits by friend
  const friendDeposits = {};
  friends.forEach(f => {
    friendDeposits[f.id] = transactions
      .filter(t => t.type === 'pool_deposit' && t.paid_by_id === f.id)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  });

  // Group manager pool expenses by category
  const poolCategorySpends = {};
  transactions
    .filter(t => t.type === 'pool_expense')
    .forEach(t => {
      const cat = t.category || 'misc';
      poolCategorySpends[cat] = (poolCategorySpends[cat] || 0) + Number(t.amount || 0);
    });

  const categories = Object.keys(poolCategorySpends);

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md mb-8">
      {/* Header with Flow Switcher Tabs */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/70">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Interactive Money-Flow Visualizer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directional flow of funds between friends, manager, and settlement debts
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveFlowMode('pool')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeFlowMode === 'pool'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>1. Pool & Expense Flow</span>
          </button>

          <button
            onClick={() => setActiveFlowMode('settlement')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeFlowMode === 'settlement'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Settlement Payouts</span>
            {settlements.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">
                {settlements.length}
              </span>
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 bg-slate-950/[0.02] dark:bg-slate-950/40 min-h-[460px] relative">
        <AnimatePresence mode="wait">
          
          {/* FLOW MODE 1: FRIENDS -> MANAGER POOL -> EXPENSES */}
          {activeFlowMode === 'pool' && (
            <motion.div
              key="pool-flow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6 px-2">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-teal-600 dark:text-teal-400">
                  Step 1: Friends Pooling
                </span>
                <span className="font-semibold uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                  Step 2: Pool Manager (Cash Holding)
                </span>
                <span className="font-semibold uppercase tracking-wider text-[11px] text-amber-600 dark:text-amber-400">
                  Step 3: Itemized Expenses
                </span>
              </div>

              {/* Responsive 3-Column Visual Flow Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Column 1: Friends Contributing (Left) */}
                <div className="md:col-span-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between px-1">
                    <span>Contributing Friends</span>
                    <span className="text-[11px] text-slate-400">{friends.length} Members</span>
                  </div>

                  {friends.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-400">
                      Add friends to see pool deposits
                    </div>
                  ) : (
                    friends.map((f) => {
                      const deposit = friendDeposits[f.id] || 0;
                      return (
                        <div
                          key={f.id}
                          className="relative p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-between group hover:border-brand-500/60 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs"
                              style={{ backgroundColor: f.color || '#0d9488' }}
                            >
                              {f.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {f.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {deposit > 0 ? `Deposited ${formatCurrency(deposit, currency)}` : 'No deposit yet'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                            <span className="text-xs font-black">
                              {deposit > 0 ? formatCurrency(deposit, currency) : '—'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Column 2: Central Manager Pool Node (Center) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center py-4">
                  <div className="w-full max-w-xs relative group">
                    {/* Glowing effect */}
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-teal-500 to-amber-500 opacity-30 group-hover:opacity-60 blur-md transition duration-300" />
                    
                    <div className="relative p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-500/40 shadow-xl text-center">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-3">
                        <Wallet className="w-7 h-7" />
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Pool Manager
                      </span>

                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {manager ? manager.name : 'Designated Manager'}
                      </h4>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Total Pool Inflow:</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(totalPoolCollected, currency)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 dark:text-slate-400">Cash in Hand:</span>
                          <span className={`font-bold ${remainingPoolCash >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'}`}>
                            {formatCurrency(remainingPoolCash, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 italic">
                        {manager?.upi_id ? `UPI: ${manager.upi_id}` : 'Holds physical/UPI cash pool'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Category Outflows (Right) */}
                <div className="md:col-span-4 space-y-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between px-1">
                    <span>Pool Expenditures</span>
                    <span className="text-[11px] text-slate-400">{categories.length} Categories</span>
                  </div>

                  {categories.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-400">
                      No pool expenses logged yet.
                    </div>
                  ) : (
                    categories.map((cat) => {
                      const amount = poolCategorySpends[cat];
                      return (
                        <div
                          key={cat}
                          className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center justify-between hover:border-amber-500/60 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold uppercase">
                              {cat.slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">
                                {cat}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Disbursed from pool
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                              {formatCurrency(amount, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* FLOW MODE 2: SETTLEMENT DIRECTED GRAPH */}
          {activeFlowMode === 'settlement' && (
            <motion.div
              key="settle-flow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-6">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Directional Debt Simplification Arrows
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200/60 font-semibold">
                  {settlements.length} Total Settlements Needed
                </span>
              </div>

              {settlements.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    All balances are currently settled!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Everyone has paid their exact share and unspent pool cash is balanced.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {settlements.map((s, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden"
                    >
                      {/* Visual Direction Line */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Debtor (Who Pays) */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">
                            Payer (Owes)
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {s.fromName.charAt(0)}
                            </div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {s.fromName}
                            </span>
                          </div>
                          {s.fromIsManager && (
                            <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                              (From Pool Cash)
                            </span>
                          )}
                        </div>

                        {/* Animated Transfer Badge */}
                        <div className="flex flex-col items-center flex-shrink-0 px-2">
                          <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                            {formatCurrency(s.amount, currency)}
                          </span>
                          <div className="flex items-center text-brand-500 dark:text-brand-400 mt-1">
                            <span className="w-6 h-0.5 bg-brand-400" />
                            <ArrowRight className="w-4 h-4 -ml-1 text-brand-500" />
                          </div>
                        </div>

                        {/* Creditor (Who Receives) */}
                        <div className="flex-1 min-w-0 text-right">
                          <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                            Recipient
                          </span>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {s.toName}
                            </span>
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {s.toName.charAt(0)}
                            </div>
                          </div>
                          {s.toUpi && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              {s.toUpi}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Settlement Action Bar */}
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          Settlement Step #{idx + 1}
                        </span>
                        {s.toUpi && (
                          <button
                            onClick={() => navigator.clipboard.writeText(s.toUpi)}
                            className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            Copy UPI
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
