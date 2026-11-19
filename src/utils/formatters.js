/**
 * Formatting & Category Utility Helpers
 */

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED '
};

export const formatCurrency = (amount, currency = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const val = Number(amount) || 0;
  
  if (currency === 'INR') {
    return `${symbol}${val.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(val) ? 0 : 2
    })}`;
  }
  
  return `${symbol}${val.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(val) ? 0 : 2
  })}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: 'Utensils', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { id: 'accommodation', label: 'Stay & Villa', icon: 'Hotel', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { id: 'travel', label: 'Travel & Cabs', icon: 'Plane', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { id: 'gift', label: 'Gifts & Registry', icon: 'Gift', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { id: 'activities', label: 'Activities & Fun', icon: 'Sparkles', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { id: 'shopping', label: 'Shopping & Supplies', icon: 'ShoppingBag', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { id: 'misc', label: 'Miscellaneous', icon: 'Receipt', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
];

export const getCategoryMeta = (catId) => {
  return CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
};

export const TRANSACTION_TYPES = {
  pool_deposit: {
    label: 'Pool Deposit',
    badge: 'Deposit to Pool',
    desc: 'Friend gives money to Manager to hold in pool',
    color: 'emerald',
    icon: 'ArrowDownLeft'
  },
  pool_expense: {
    label: 'Pool Expense',
    badge: 'Paid from Pool',
    desc: 'Manager spends from the collected pool on an item',
    color: 'blue',
    icon: 'Wallet'
  },
  direct_expense: {
    label: 'Direct Expense',
    badge: 'Paid by Friend',
    desc: 'Friend pays out of pocket directly for an item',
    color: 'violet',
    icon: 'CreditCard'
  }
};
