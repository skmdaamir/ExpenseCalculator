import React from 'react';
import { 
  PieChart, 
  Receipt, 
  GitFork, 
  CheckCircle2, 
  Plus, 
  FileText 
} from 'lucide-react';

export const MobileBottomNav = ({
  activeTab,
  onTabChange,
  onOpenAddTransaction,
  onOpenReport,
  transactionCount = 0,
  settlementCount = 0
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: PieChart },
    { id: 'expenses', label: 'Expenses', icon: Receipt, badge: transactionCount },
    { id: 'flow', label: 'Flow', icon: GitFork },
    { id: 'settle', label: 'Settle', icon: CheckCircle2, badge: settlementCount, badgeColor: 'bg-rose-500' },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) - Elevated for quick thumb access */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onOpenAddTransaction}
          title="Add Expense or Item"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-teal-500 text-white shadow-xl shadow-brand-500/40 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Bottom Sticky Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800/90 shadow-2xl pb-safe">
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 transition-all ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-brand-600 dark:text-brand-400' : ''} transition-transform`} />
                  {item.badge > 0 && (
                    <span className={`absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold text-white flex items-center justify-center ${item.badgeColor || 'bg-brand-600'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 w-8 h-1 bg-brand-600 dark:bg-brand-400 rounded-t-full" />
                )}
              </button>
            );
          })}

          {/* Quick PDF Report Button on Bottom Bar */}
          <button
            onClick={onOpenReport}
            className="flex flex-col items-center justify-center py-1 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <FileText className="w-5 h-5 text-indigo-500" />
            <span className="text-[10px] mt-1 tracking-tight font-medium">PDF Report</span>
          </button>
        </div>
      </nav>
    </>
  );
};
