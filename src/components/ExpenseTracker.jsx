import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Tag, 
  Wallet, 
  CreditCard, 
  ArrowDownLeft, 
  Calendar,
  Layers,
  ChevronRight,
  Package,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { 
  formatCurrency, 
  formatDate, 
  getCategoryMeta, 
  CATEGORIES, 
  TRANSACTION_TYPES 
} from '../utils/formatters';

export const ExpenseTracker = ({
  event,
  transactions = [],
  participants = [],
  currency = 'INR',
  onOpenAddTransaction,
  onDeleteTransaction
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const participantMap = new Map(participants.map(p => [p.id, p]));

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    const matchesType = selectedType === 'all' || tx.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm mb-6 sm:mb-8">
      {/* Top Controls & Search Bar */}
      <CardHeader className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Itemized Expenses & Transaction Ledger
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Track item purchases, pool deposits, and direct spends
            </p>
          </div>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={onOpenAddTransaction}
            className="hidden sm:inline-flex"
          >
            Add New Item / Expense
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, gifts, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="pool_deposit">Pool Deposits</option>
              <option value="pool_expense">Pool Expenses</option>
              <option value="direct_expense">Direct Spends</option>
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      {/* Transaction Items List */}
      <CardContent className="p-0">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No transactions match your search.
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting filters or log a new transaction.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const typeMeta = TRANSACTION_TYPES[tx.type] || TRANSACTION_TYPES.pool_expense;
              const catMeta = getCategoryMeta(tx.category);
              const payer = participantMap.get(tx.paid_by_id);
              const splitPersons = (tx.split_between || [])
                .map(pid => participantMap.get(pid))
                .filter(Boolean);

              return (
                <div
                  key={tx.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Icon, Title, Category & Split Meta */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      tx.type === 'pool_deposit'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'pool_expense'
                        ? 'bg-blue-500/10 text-blue-600 dark:dark:text-blue-400'
                        : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                    }`}>
                      {tx.type === 'pool_deposit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : tx.type === 'pool_expense' ? (
                        <Wallet className="w-5 h-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          tx.type === 'pool_deposit'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                            : tx.type === 'pool_expense'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                        }`}>
                          {typeMeta.badge}
                        </span>

                        {tx.type !== 'pool_deposit' && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {catMeta.label}
                          </span>
                        )}

                        {tx.quantity > 1 && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            Qty: {tx.quantity}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </h4>

                      {tx.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {tx.notes}
                        </p>
                      )}

                      {/* Split Info Chips */}
                      {tx.type !== 'pool_deposit' && splitPersons.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-slate-400 font-medium">Split between:</span>
                          {splitPersons.map(p => (
                            <span
                              key={p.id}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color || '#0d9488' }} />
                              {p.name.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount, Paid By, Date & Delete Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800/60">
                    <div className="text-left sm:text-right">
                      <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {formatCurrency(tx.amount, currency)}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {tx.type === 'pool_deposit' ? (
                          <>From <span className="font-semibold text-slate-700 dark:text-slate-300">{payer?.name || 'Friend'}</span></>
                        ) : tx.type === 'pool_expense' ? (
                          <>Paid from Pool by <span className="font-semibold text-blue-600 dark:text-blue-400">{payer?.name || 'Manager'}</span></>
                        ) : (
                          <>Direct paid by <span className="font-semibold text-purple-600 dark:text-purple-400">{payer?.name || 'Friend'}</span></>
                        )}
                        {tx.date && ` • ${formatDate(tx.date)}`}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      title="Delete Transaction"
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
