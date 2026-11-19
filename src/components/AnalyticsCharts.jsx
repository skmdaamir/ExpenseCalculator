import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { Card, CardHeader, CardContent } from './UI/Card';
import { formatCurrency, getCategoryMeta } from '../utils/formatters';

const CHART_COLORS = [
  '#0d9488', // teal
  '#2563eb', // blue
  '#f59e0b', // amber
  '#ec4899', // rose
  '#8b5cf6', // purple
  '#10b981', // emerald
  '#64748b', // slate
];

export const AnalyticsCharts = ({ finances, currency = 'INR' }) => {
  const { categoryBreakdown = {}, participantsSummary = [], totalSpent = 0 } = finances || {};

  // Format data for Category Pie Chart
  const categoryData = Object.entries(categoryBreakdown)
    .filter(([_, amount]) => amount > 0)
    .map(([cat, amount], idx) => {
      const meta = getCategoryMeta(cat);
      return {
        name: meta.label,
        categoryKey: cat,
        value: amount,
        percentage: totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0,
        color: CHART_COLORS[idx % CHART_COLORS.length]
      };
    })
    .sort((a, b) => b.value - a.value);

  // Format data for Person Comparison Bar Chart
  const participantData = participantsSummary.map(p => ({
    name: p.name.split(' ')[0], // First name for neat labels
    fullName: p.name,
    Contributed: p.totalContributed,
    FairShare: p.totalExpenseShare,
    Net: p.netBalance
  }));

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-slate-300 mt-1">
            Amount: <span className="font-semibold text-white">{formatCurrency(data.value, currency)}</span>
          </p>
          <p className="text-slate-400">Share of Total: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs">
          <p className="font-bold text-sm mb-1">{payload[0]?.payload?.fullName || label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex justify-between gap-4 py-0.5" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-bold">{formatCurrency(entry.value, currency)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
      
      {/* Category Breakdown (Donut Chart) */}
      <Card className="lg:col-span-5 flex flex-col">
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Expenses by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Itemized spending distribution across buckets
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {categoryData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category Chips Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {categoryData.slice(0, 6).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                <span className="ml-auto font-bold text-slate-800 dark:text-slate-200">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Participant Spending vs Fair Share (Bar Chart) */}
      <Card className="lg:col-span-7 flex flex-col">
        <CardHeader>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Contribution vs. Fair Share
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare total out-of-pocket paid vs calculated cost responsibility
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {participantData.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No participant data available.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={participantData} margin={{ top: 20, right: 15, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Contributed" name="Total Contributed" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FairShare" name="Fair Expense Share" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
