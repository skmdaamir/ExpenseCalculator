import React from 'react';
import { motion } from 'framer-motion';
import { 
  PiggyBank, 
  Receipt, 
  Wallet, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { Card } from './UI/Card';
import { formatCurrency } from '../utils/formatters';

export const AnalyticsCards = ({ finances, currency = 'INR', onSwitchTab }) => {
  const {
    totalPoolCollected = 0,
    totalSpent = 0,
    totalPoolSpent = 0,
    totalDirectSpent = 0,
    remainingPoolCash = 0,
    perPersonAverage = 0,
  } = finances || {};

  const cards = [
    {
      id: 'pool-collected',
      title: 'Total Pool Collected',
      amount: totalPoolCollected,
      subtitle: 'Contributed by friends into pool',
      icon: PiggyBank,
      color: 'emerald',
      bgGlow: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20',
      badge: 'Cash Inflow'
    },
    {
      id: 'total-spent',
      title: 'Total Group Expenses',
      amount: totalSpent,
      subtitle: `Pool: ${formatCurrency(totalPoolSpent, currency)} • Direct: ${formatCurrency(totalDirectSpent, currency)}`,
      icon: Receipt,
      color: 'blue',
      bgGlow: 'from-blue-500/10 to-indigo-500/5',
      border: 'border-blue-500/20',
      badge: 'Total Spent'
    },
    {
      id: 'remaining-cash',
      title: 'Unspent Pool Cash (Manager)',
      amount: remainingPoolCash,
      subtitle: remainingPoolCash >= 0 ? 'Surplus cash in Manager hands' : 'Deficit paid by Manager',
      icon: Wallet,
      color: remainingPoolCash >= 0 ? 'amber' : 'rose',
      bgGlow: remainingPoolCash >= 0 ? 'from-amber-500/10 to-yellow-500/5' : 'from-rose-500/10 to-red-500/5',
      border: remainingPoolCash >= 0 ? 'border-amber-500/20' : 'border-rose-500/20',
      badge: remainingPoolCash >= 0 ? 'To Be Returned' : 'Manager Due'
    },
    {
      id: 'per-person',
      title: 'Per-Person Fair Share',
      amount: perPersonAverage,
      subtitle: 'Average cost per group member',
      icon: Users,
      color: 'purple',
      bgGlow: 'from-purple-500/10 to-violet-500/5',
      border: 'border-purple-500/20',
      badge: 'Avg Split'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className={`relative overflow-hidden border p-5 bg-gradient-to-br ${card.bgGlow} ${card.border} hover:shadow-lg transition-all`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    {card.title}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                    {formatCurrency(card.amount, currency)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-800 dark:text-slate-200">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px]">
                  {card.subtitle}
                </span>
                <span className="font-semibold px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-800/80 shadow-xs text-slate-700 dark:text-slate-300">
                  {card.badge}
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
