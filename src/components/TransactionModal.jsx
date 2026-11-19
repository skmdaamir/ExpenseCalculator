import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Wallet, 
  CreditCard, 
  Check, 
  Users, 
  Tag, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { CATEGORIES, TRANSACTION_TYPES, formatCurrency } from '../utils/formatters';

export const TransactionModal = ({
  isOpen,
  onClose,
  participants = [],
  currency = 'INR',
  onSave
}) => {
  const managers = participants.filter(p => p.is_manager);
  const defaultManager = managers[0] || participants[0];

  const [txType, setTxType] = useState('pool_expense'); // 'pool_deposit', 'pool_expense', 'direct_expense'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paidById, setPaidById] = useState('');
  const [managerId, setManagerId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [error, setError] = useState('');

  // Reset or initialize state when opened
  useEffect(() => {
    if (isOpen) {
      setError('');
      setTitle('');
      setAmount('');
      setQuantity(1);
      setCategory('food');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      
      const defaultMgrId = defaultManager?.id || (participants[0]?.id || '');
      setManagerId(defaultMgrId);

      // Default paid_by depends on type
      if (txType === 'pool_expense') {
        setPaidById(defaultMgrId);
      } else {
        const firstFriend = participants.find(p => !p.is_manager) || participants[0];
        setPaidById(firstFriend?.id || '');
      }

      // Default split among all participants
      setSplitBetween(participants.map(p => p.id));
    }
  }, [isOpen, txType, participants]);

  const toggleParticipantSplit = (pid) => {
    setSplitBetween(prev => {
      if (prev.includes(pid)) {
        if (prev.length === 1) return prev; // Keep at least one person
        return prev.filter(id => id !== pid);
      } else {
        return [...prev, pid];
      }
    });
  };

  const handleSelectAllSplit = () => {
    setSplitBetween(participants.map(p => p.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please enter a title or item name.');
      return;
    }
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!paidById) {
      setError('Please select who paid / contributed.');
      return;
    }
    if (txType === 'pool_deposit' && !managerId) {
      setError('Please select which Manager receives the pool deposit.');
      return;
    }
    if (txType !== 'pool_deposit' && splitBetween.length === 0) {
      setError('Please select at least one person to split the expense with.');
      return;
    }

    const txData = {
      type: txType,
      title: title.trim(),
      category: txType === 'pool_deposit' ? 'misc' : category,
      amount: numAmount,
      quantity: parseInt(quantity) || 1,
      paid_by_id: paidById,
      manager_id: txType === 'pool_deposit' ? managerId : (paidById === managerId ? managerId : null),
      date,
      notes: notes.trim(),
      split_between: txType === 'pool_deposit' ? [] : splitBetween
    };

    onSave(txData);
    onClose();
  };

  const splitSharePreview = amount && splitBetween.length > 0 
    ? (parseFloat(amount) / splitBetween.length).toFixed(2)
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction or Item"
      subtitle="Log pool deposits, manager expenses from pool, or friend direct spends"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Transaction Type Segmented Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            
            {/* Type 1: Pool Deposit */}
            <button
              type="button"
              onClick={() => {
                setTxType('pool_deposit');
                setPaidById(participants.find(p => !p.is_manager)?.id || participants[0]?.id || '');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                txType === 'pool_deposit'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Pool Deposit
                </span>
                {txType === 'pool_deposit' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Friend contributes cash/UPI into Manager's pool
              </span>
            </button>

            {/* Type 2: Pool Expense */}
            <button
              type="button"
              onClick={() => {
                setTxType('pool_expense');
                setPaidById(defaultManager?.id || participants[0]?.id || '');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                txType === 'pool_expense'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Pool Expense
                </span>
                {txType === 'pool_expense' && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Manager spends from collected group pool
              </span>
            </button>

            {/* Type 3: Direct Expense */}
            <button
              type="button"
              onClick={() => {
                setTxType('direct_expense');
                setPaidById(participants.find(p => !p.is_manager)?.id || participants[0]?.id || '');
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                txType === 'direct_expense'
                  ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Direct Spend
                </span>
                {txType === 'direct_expense' && <Check className="w-3.5 h-3.5 text-purple-600" />}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                Friend pays directly out of pocket for an item
              </span>
            </button>

          </div>
        </div>

        {/* 2. Title & Amount Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {txType === 'pool_deposit' ? 'Deposit Label' : 'Item / Expense Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={
                txType === 'pool_deposit' 
                  ? 'e.g., Initial Pool Fund, Extra Pool UPI' 
                  : 'e.g., Beach Villa Booking, Espresso Machine, Dinner Platter'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                required
                placeholder="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Category & Quantity (If not deposit) */}
        {txType !== 'pool_deposit' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. Roles: Payer & Manager Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {txType === 'pool_deposit' ? 'Depositing Friend (Payer) *' : txType === 'pool_expense' ? 'Disbursed by Manager (from Pool) *' : 'Paid Out of Pocket By *'}
            </label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.is_manager ? '(Manager)' : ''}
                </option>
              ))}
            </select>
          </div>

          {txType === 'pool_deposit' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Holding Pool Manager (Recipient) *
              </label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                {participants.filter(p => p.is_manager).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Manager)
                  </option>
                ))}
                {participants.every(p => !p.is_manager) && (
                  <option value={participants[0]?.id}>
                    {participants[0]?.name}
                  </option>
                )}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 5. Expense Split Selector (Only for expenses, not pool deposits) */}
        {txType !== 'pool_deposit' && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  Split Cost Between ({splitBetween.length} selected)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {splitBetween.length > 0 && amount 
                    ? `Equal share: ${formatCurrency(splitSharePreview, currency)} / person`
                    : 'Select participants who share this cost'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSelectAllSplit}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Select All
              </button>
            </div>

            {/* Participant selector pills */}
            <div className="flex flex-wrap gap-2">
              {participants.map(p => {
                const isSelected = splitBetween.includes(p.id);
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => toggleParticipantSplit(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#ffffff' : (p.color || '#0d9488') }} />
                    <span>{p.name.split(' ')[0]}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Reference (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., UPI Transaction ID, Amazon Order #, or receipt details"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Transaction
          </Button>
        </div>

      </form>
    </Modal>
  );
};
