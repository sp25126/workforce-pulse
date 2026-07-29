'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatCurrency } from '@/lib/formatters';
import { Award, ArrowUpRight } from 'lucide-react';

export default function AutomationRanking() {
  const { data } = useDashboard();
  if (!data) return null;

  const { automation_ranking } = data;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Automation Opportunities</span>
        </h3>
        <span className="text-xs font-semibold text-slate-400">Ranked by potential savings</span>
      </div>

      <div className="p-6 flex-1 overflow-y-auto max-h-[360px]">
        {automation_ranking.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10 font-medium">No automation targets identified.</p>
        ) : (
          <div className="space-y-4">
            {automation_ranking.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-start justify-between p-3.5 border border-slate-100 hover:border-amber-200 bg-slate-50 hover:bg-amber-50/20 rounded-lg transition-all"
              >
                <div className="flex items-start space-x-3.5">
                  {/* Rank circle */}
                  <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-800 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{item.task_category}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{item.reason}</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end pl-4 shrink-0">
                  <span className="text-sm font-bold text-slate-800 flex items-center">
                    {formatCurrency(item.inr_recoverable)}
                    <ArrowUpRight className="h-3 w-3 text-emerald-500 ml-0.5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-1">
                    {formatHours(item.hours_recoverable)} recoverable
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
