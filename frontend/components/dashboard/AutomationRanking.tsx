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
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Award className="h-4.5 w-4.5 text-amber-500" />
            <span>Automation Opportunities</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Tasks ranked by recoverable hours & cost impact</p>
        </div>
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
          Sorted by ROI
        </span>
      </div>

      <div className="p-5 md:p-6 flex-1 overflow-y-auto max-h-[380px]">
        {automation_ranking.length === 0 ? (
          <p className="text-slate-400 text-xs font-semibold text-center py-10">No automation targets identified matching current scope.</p>
        ) : (
          <div className="space-y-3">
            {automation_ranking.map((item, idx) => {
              const isFirst = idx === 0;
              return (
                <div 
                  key={idx} 
                  className={`flex items-start justify-between p-4 border rounded-xl transition-all duration-200 ${
                    isFirst 
                      ? 'border-amber-200/90 bg-amber-50/25 hover:bg-amber-50/40 shadow-2xs' 
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 bg-slate-50/20'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 min-w-0 pr-2">
                    {/* Rank Indicator */}
                    <div className={`h-7 w-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 border ${
                      isFirst 
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs' 
                        : 'bg-white border-slate-200/90 text-slate-600'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{item.task_category}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">{item.reason}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0 pl-2">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center">
                      {formatCurrency(item.inr_recoverable)}
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500 ml-0.5 shrink-0" />
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
