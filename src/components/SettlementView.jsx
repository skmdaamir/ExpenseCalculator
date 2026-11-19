import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ArrowRight, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ShieldCheck, 
  Wallet, 
  HelpCircle,
  ExternalLink,
  MessageSquare,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { formatCurrency, round2 } from '../utils/formatters';

export const SettlementView = ({
  event,
  participants = [],
  finances,
  currency = 'INR',
  onOpenReport
}) => {
  const {
    participantsSummary = [],
    settlements = [],
    remainingPoolCash = 0,
    isBalanced = true
  } = finances || {};

  const [copiedUpi, setCopiedUpi] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [settledSteps, setSettledSteps] = useState(new Set());

  const toggleStepSettled = (stepIndex) => {
    setSettledSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepIndex)) {
        next.delete(stepIndex);
      } else {
        next.add(stepIndex);
        // Trigger celebratory confetti if all steps are settled
        if (next.size === settlements.length) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
      return next;
    });
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(id);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  // Generate shareable WhatsApp text message
  const generateShareSummary = () => {
    let msg = `💰 *${event.title} - Final Settlement Summary*\n`;
    msg += `Total Group Spend: ${formatCurrency(finances.totalSpent, currency)}\n`;
    if (remainingPoolCash !== 0) {
      msg += `Remaining Pool Cash with Manager: ${formatCurrency(remainingPoolCash, currency)}\n`;
    }
    msg += `------------------------------------\n`;
    msg += `*Exact Payout Instructions (Min Transactions):*\n`;

    if (settlements.length === 0) {
      msg += `✅ All balances are completely settled to zero!\n`;
    } else {
      settlements.forEach((s, idx) => {
        msg += `${idx + 1}. *${s.fromName}* pays *${formatCurrency(s.amount, currency)}* to *${s.toName}*`;
        if (s.toUpi) msg += ` (UPI: ${s.toUpi})`;
        msg += `\n`;
      });
    }

    msg += `------------------------------------\n`;
    msg += `Calculated cleanly via PoolSplit 🚀`;
    return msg;
  };

  const handleCopyShareSummary = () => {
    const text = generateShareSummary();
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-8 mb-8">
      
      {/* 1. Step-by-Step Settlement Instructions */}
      <Card className="border-2 border-brand-500/30 dark:border-brand-500/20 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-50/80 via-white to-brand-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                🤝
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Debt Simplification & Exact Payouts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Minimum transaction greedy algorithm accounts for both out-of-pocket spends & unspent pool cash
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenReport && (
              <Button
                size="sm"
                variant="outline"
                icon={FileText}
                onClick={onOpenReport}
                className="text-xs"
              >
                PDF Report
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              icon={copiedSummary ? Check : Share2}
              onClick={handleCopyShareSummary}
              className="text-xs"
            >
              {copiedSummary ? 'Summary Copied!' : 'Copy for WhatsApp'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {settlements.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Everything is 100% Settled!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                No debts remaining. All participants have contributed exactly their fair share, and any pool cash has been reconciled.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {settlements.map((step, idx) => {
                const isSettled = settledSteps.has(idx);

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSettled
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 shadow-xs hover:border-brand-500/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Who pays Whom */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStepSettled(idx)}
                          title={isSettled ? "Mark as Unsettled" : "Mark as Settled"}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
                            isSettled
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        <div className="text-sm">
                          <span className={`font-bold text-slate-900 dark:text-white ${isSettled ? 'line-through' : ''}`}>
                            {step.fromName}
                          </span>
                          {step.fromIsManager && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold ml-1">
                              (Manager holding unspent pool cash)
                            </span>
                          )}
                          <span className="text-slate-400 mx-2 font-medium">pays</span>
                          <span className={`font-bold text-slate-900 dark:text-white ${isSettled ? 'line-through' : ''}`}>
                            {step.toName}
                          </span>
                        </div>
                      </div>

                      {/* Right: Amount & UPI Action */}
                      <div className="flex items-center gap-3 sm:self-center pl-10 sm:pl-0">
                        <span className="text-base sm:text-lg font-black text-brand-600 dark:text-brand-400">
                          {formatCurrency(step.amount, currency)}
                        </span>

                        {step.toUpi && (
                          <button
                            onClick={() => copyToClipboard(step.toUpi, idx)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            {copiedUpi === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>{step.toUpi}</span>
                              </>
                            )}
                          </button>
                        )}

                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          isSettled
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {isSettled ? 'Settled' : 'Pending'}
                        </span>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Detailed Member Financial Balances Breakdown Table */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Participant Balance Sheet & Entitlements
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total out-of-pocket money provided, fair consumption share, physical pool cash, and net economic entitlement
          </p>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5 sm:p-4">Participant</th>
                <th className="p-3.5 sm:p-4">Pool Deposits</th>
                <th className="p-3.5 sm:p-4">Direct Spends</th>
                <th className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">Total Contributed</th>
                <th className="p-3.5 sm:p-4">Fair Expense Share</th>
                <th className="p-3.5 sm:p-4">Cash in Hand</th>
                <th className="p-3.5 sm:p-4 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {participantsSummary.map((p) => {
                const isOverpaid = p.netBalance > 0.01;
                const isOwed = p.netBalance < -0.01;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: p.color }}
                        >
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{p.name}</span>
                            {p.isManager && (
                              <Badge variant="manager" size="sm">Manager</Badge>
                            )}
                          </div>
                          {p.upiId && (
                            <span className="text-[11px] text-slate-400">{p.upiId}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.poolDepositsMade, currency)}
                    </td>

                    <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.directExpensesPaid, currency)}
                    </td>

                    <td className="p-3.5 sm:p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(p.totalContributed, currency)}
                    </td>

                    <td className="p-3.5 sm:p-4 text-slate-600 dark:text-slate-300">
                      {formatCurrency(p.totalExpenseShare, currency)}
                    </td>

                    <td className="p-3.5 sm:p-4">
                      {p.isManager ? (
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {formatCurrency(p.cashInHand, currency)}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="p-3.5 sm:p-4 text-right">
                      <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md text-xs ${
                        isOverpaid
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : isOwed
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>
                        {isOverpaid ? `+${formatCurrency(p.netBalance, currency)} (Gets)` : isOwed ? `-${formatCurrency(Math.abs(p.netBalance), currency)} (Owes)` : 'Settled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

    </div>
  );
};
