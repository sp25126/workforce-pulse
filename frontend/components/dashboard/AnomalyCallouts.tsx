'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { AlertOctagon, AlertTriangle, HelpCircle } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default function AnomalyCallouts() {
  const { data } = useDashboard();
  if (!data) return null;

  const { anomalies } = data;

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <AlertOctagon className="h-5 w-5 text-rose-500" />
          <span>Activity Quality Flags</span>
        </h3>
        <span className="bg-rose-50 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">
          {anomalies.length} Flagged
        </span>
      </div>

      <div className="p-6 flex-1 overflow-y-auto max-h-[360px]">
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-emerald-500 text-3xl mb-2">✓</span>
            <p className="text-slate-500 text-sm font-semibold">All clear! No data anomalies flagged.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {anomalies.map((item, idx) => {
              let Icon = HelpCircle;
              let bgClass = "bg-slate-50 border-slate-200";
              let textClass = "text-slate-800";
              let iconClass = "text-slate-500 bg-slate-100";

              if (item.type === "negative_duration") {
                Icon = AlertTriangle;
                bgClass = "bg-rose-50/50 border-rose-100";
                textClass = "text-rose-900";
                iconClass = "text-rose-700 bg-rose-150";
              } else if (item.type === "outlier_duration") {
                Icon = AlertOctagon;
                bgClass = "bg-amber-50/50 border-amber-100";
                textClass = "text-amber-900";
                iconClass = "text-amber-700 bg-amber-150";
              }

              return (
                <div 
                  key={idx} 
                  className={`border rounded-lg p-3.5 flex items-start space-x-3 ${bgClass} transition-all`}
                >
                  <div className={`p-1.5 rounded-full ${iconClass} shrink-0 mt-0.5`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-xs ${textClass} tracking-wide uppercase`}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400 text-[10px] font-semibold">•</span>
                      <span className="text-slate-500 text-[10px] font-semibold">{formatDate(item.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                      {item.description}
                    </p>
                    <div className="text-[10px] font-bold text-slate-400">
                      Employee ID: {item.employee_id}
                    </div>
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
