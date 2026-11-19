import React, { useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Share2, 
  Check, 
  Wallet, 
  ShieldCheck, 
  Calendar, 
  Coins, 
  ArrowRight,
  Receipt
} from 'lucide-react';
import { Modal } from './UI/Modal';
import { Button } from './UI/Button';
import { Badge } from './UI/Badge';
import { formatCurrency, formatDate, getCategoryMeta } from '../utils/formatters';

export const ReportModal = ({
  isOpen,
  onClose,
  event,
  participants = [],
  transactions = [],
  finances,
  currency = 'INR'
}) => {
  const printRef = useRef(null);

  if (!event || !finances) return null;

  const {
    totalPoolCollected = 0,
    totalSpent = 0,
    totalPoolSpent = 0,
    totalDirectSpent = 0,
    remainingPoolCash = 0,
    perPersonAverage = 0,
    participantsSummary = [],
    settlements = []
  } = finances;

  const managers = participants.filter(p => p.is_manager);
  const managerNames = managers.map(m => m.name).join(', ') || 'None assigned';

  // Trigger browser print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  // Export as CSV
  const handleExportCsv = () => {
    let csv = `Event: ${event.title}\n`;
    csv += `Category: ${event.category}\n`;
    csv += `Generated At: ${new Date().toLocaleString()}\n`;
    csv += `Manager: ${managerNames}\n`;
    csv += `Total Pool Collected: ${totalPoolCollected}\n`;
    csv += `Total Expenses: ${totalSpent}\n`;
    csv += `Remaining Pool Cash: ${remainingPoolCash}\n\n`;

    // 1. Settlements
    csv += `--- SETTLEMENT PAYOUTS ---\n`;
    csv += `From,To,Amount,UPI ID\n`;
    settlements.forEach(s => {
      csv += `"${s.fromName}","${s.toName}",${s.amount},"${s.toUpi || ''}"\n`;
    });
    csv += `\n`;

    // 2. Participant Balances
    csv += `--- PARTICIPANT BALANCES ---\n`;
    csv += `Name,Role,Pool Deposits,Direct Spends,Total Contributed,Fair Share,Cash Held,Net Balance\n`;
    participantsSummary.forEach(p => {
      csv += `"${p.name}","${p.isManager ? 'Manager' : 'Member'}",${p.poolDepositsMade},${p.directExpensesPaid},${p.totalContributed},${p.totalExpenseShare},${p.cashInHand},${p.netBalance}\n`;
    });
    csv += `\n`;

    // 3. Transactions Ledger
    csv += `--- ITEMIZED EXPENSES & TRANSACTIONS ---\n`;
    csv += `Date,Type,Title,Category,Amount,Paid By,Quantity,Notes\n`;
    transactions.forEach(t => {
      const payer = participants.find(p => p.id === t.paid_by_id);
      csv += `"${t.date || ''}","${t.type}","${t.title}","${t.category}",${t.amount},"${payer?.name || ''}",${t.quantity || 1},"${t.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_')}_Financial_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Financial Statement & PDF Report"
      subtitle="Complete accounting ledger, balance sheet, and settlement instructions"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        
        {/* Action Header (Hidden during actual print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 no-print">
          <div className="flex items-center gap-2 text-xs text-brand-900 dark:text-brand-200">
            <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
            <span>Ready for official download as PDF or spreadsheet.</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Download}
              onClick={handleExportCsv}
              className="text-xs"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Printer}
              onClick={handlePrintPdf}
              className="text-xs shadow-sm"
            >
              Download / Print PDF
            </Button>
          </div>
        </div>

        {/* Printable Document Container */}
        <div
          ref={printRef}
          id="printable-report"
          className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white space-y-6 print:border-none print:p-0 print:shadow-none"
        >
          {/* Document Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
                  PoolSplit • Official Financial Report
                </span>
                <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {event.title}
                </h2>
                {event.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs text-slate-400 block">Generated On</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  <ShieldCheck className="w-3 h-3" />
                  Mgr: {managerNames}
                </div>
              </div>
            </div>
          </div>

          {/* Executive Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pool Inflow</span>
              <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalPoolCollected, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Expenses</span>
              <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(totalSpent, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Unspent Pool Cash</span>
              <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(remainingPoolCash, currency)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Fair Share / Person</span>
              <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-400">
                {formatCurrency(perPersonAverage, currency)}
              </span>
            </div>
          </div>

          {/* Section 1: Debt Simplification & Payout Instructions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <span>1. Final Settlement Payout Instructions</span>
              <span className="text-[10px] text-slate-400 font-normal">({settlements.length} transactions)</span>
            </h3>

            {settlements.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                All balances are settled. No payments required.
              </p>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">From (Debtor)</th>
                      <th className="p-2.5">To (Recipient)</th>
                      <th className="p-2.5">Amount</th>
                      <th className="p-2.5">Recipient UPI / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {settlements.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-rose-600 dark:text-rose-400">
                          {s.fromName} {s.fromIsManager ? '(Manager holding pool cash)' : ''}
                        </td>
                        <td className="p-2.5 font-semibold text-emerald-600 dark:text-emerald-400">
                          {s.toName}
                        </td>
                        <td className="p-2.5 font-bold">
                          {formatCurrency(s.amount, currency)}
                        </td>
                        <td className="p-2.5 text-slate-500 font-mono">
                          {s.toUpi || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 2: Participant Balance Sheet */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              2. Participant Balance Sheet & Fair Shares
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Member</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Contributed</th>
                    <th className="p-2.5">Fair Share</th>
                    <th className="p-2.5">Cash Held</th>
                    <th className="p-2.5 text-right">Net Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {participantsSummary.map((p) => {
                    const isPlus = p.netBalance > 0.01;
                    const isMinus = p.netBalance < -0.01;
                    return (
                      <tr key={p.id}>
                        <td className="p-2.5 font-bold">{p.name}</td>
                        <td className="p-2.5 text-slate-500">{p.isManager ? 'Manager' : 'Member'}</td>
                        <td className="p-2.5">{formatCurrency(p.totalContributed, currency)}</td>
                        <td className="p-2.5">{formatCurrency(p.totalExpenseShare, currency)}</td>
                        <td className="p-2.5 font-semibold text-blue-600">
                          {p.isManager ? formatCurrency(p.cashInHand, currency) : '—'}
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          <span className={isPlus ? 'text-emerald-600' : isMinus ? 'text-rose-600' : 'text-slate-500'}>
                            {isPlus ? `+${formatCurrency(p.netBalance, currency)}` : isMinus ? `-${formatCurrency(Math.abs(p.netBalance), currency)}` : '0.00'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Itemized Ledger */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              3. Complete Transaction Ledger ({transactions.length} items)
            </h3>
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Item / Title</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Paid By</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => {
                    const payer = participants.find(p => p.id === tx.paid_by_id);
                    return (
                      <tr key={tx.id}>
                        <td className="p-2.5 text-slate-500">{formatDate(tx.date)}</td>
                        <td className="p-2.5">
                          <span className="capitalize font-semibold text-[11px]">
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2.5 font-bold">
                          {tx.title}
                          {tx.notes && <span className="block text-[10px] text-slate-400 font-normal">{tx.notes}</span>}
                        </td>
                        <td className="p-2.5 text-slate-600 capitalize">{tx.category}</td>
                        <td className="p-2.5">{payer?.name || '—'}</td>
                        <td className="p-2.5 text-right font-black">
                          {formatCurrency(tx.amount, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer of the Report */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-[10px] text-slate-400">
            Report generated by PoolSplit • Group Event & Trip Expense Pooling System
          </div>
        </div>

        {/* Modal Bottom Buttons (Hidden on print) */}
        <div className="flex items-center justify-end gap-2 pt-2 no-print">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" icon={Printer} onClick={handlePrintPdf}>
            Download PDF
          </Button>
        </div>

      </div>
    </Modal>
  );
};
