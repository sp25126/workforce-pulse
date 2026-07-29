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
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/20">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <Award className="h-5 w-5 text-amber-500" />
          <span>Automation Opportunities</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sorted by savings</span>
      </div>

      <div className="p-6 flex-1 overflow-y-auto max-h-[360px]">
        {automation_ranking.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10 font-medium">No automation targets identified.</p>
        ) : (
          <div className="space-y-3">
            {automation_ranking.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start justify-between p-4 border rounded-xl transition-all duration-300 ${
                    isFirst 
                      ? 'border-amber-200 bg-amber-50/15 hover:bg-amber-50/25 shadow-sm' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Rank Indicator */}
                    <div className={`h-7 w-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm border ${
                      isFirst 
                        ? 'bg-amber-100 border-amber-200 text-amber-800' 
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">{item.task_category}</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm">{item.reason}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end pl-4 shrink-0">
                    <span className="text-sm font-extrabold text-slate-800 flex items-center">
                      {formatCurrency(item.inr_recoverable)}
                      <ArrowUpRight className="h-3 w-3 text-emerald-500 ml-0.5" />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide">
                      {formatHours(item.hours_recoverable)} rec.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
