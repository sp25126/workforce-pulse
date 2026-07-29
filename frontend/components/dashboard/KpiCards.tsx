'use client';

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatINR } from '@/lib/formatters';
import { Clock, Zap, Wallet, Activity, Info, X } from 'lucide-react';

export default function KpiCards() {
  const { data } = useDashboard();
  const [showMethodology, setShowMethodology] = useState(false);

  if (!data) return null;

  const { total_hours, hours_recoverable, inr_recoverable, automation_potential_percent } = data.headline;

  const cardConfig = [
    {
      title: "Total Hours Tracked",
      value: formatHours(total_hours),
      description: "Total work activity monitored",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      hasMethodology: false
    },
    {
      title: "Hours Recoverable",
      value: formatHours(hours_recoverable),
      description: "Potential hours saved from repetitive tasks",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      hasMethodology: true
    },
    {
      title: "Cost Recoverable",
      value: formatINR(inr_recoverable),
      description: "Potential savings from automated workflows",
      icon: Wallet,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      hasMethodology: true
    },
    {
      title: "Automation Potential",
      value: `${automation_potential_percent}%`,
      description: "Repetitive share of total working hours",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      hasMethodology: false
    }
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardConfig.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-500 tracking-tight">{card.title}</span>
                <div className={`p-2 rounded-full ${card.bgColor} ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-slate-800 leading-none">{card.value}</div>
                <p className="text-xs text-slate-400 mt-2 font-semibold">{card.description}</p>
                {card.hasMethodology && (
                  <button
                    onClick={() => setShowMethodology(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 mt-2.5 self-start cursor-pointer"
                  >
                    <Info className="h-3 w-3" />
                    <span>How is this calculated?</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span>Headline Calculation Methodology</span>
              </h3>
              <button 
                onClick={() => setShowMethodology(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Formula Definitions</h4>
                <div className="bg-slate-50 border border-slate-150 p-3 rounded font-mono text-xs text-slate-700 leading-relaxed space-y-1">
                  <div>Recoverable hours = repetitive minutes × 0.6 ÷ 60.</div>
                  <div>Recoverable INR = recoverable hours × canonical hourly rate.</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Parameters & Yield</h4>
                <p className="leading-relaxed font-semibold text-xs text-slate-500">
                  We assume a <strong className="text-slate-700 font-bold">60% (0.6) automation yield factor</strong>, representing the expected productivity recovery rate when automating repetitive task categories.
                </p>
                <p className="leading-relaxed font-semibold text-xs text-slate-500">
                  Hourly compensation rates are pulled dynamically from the employee directory (converted from LPA where applicable).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs font-semibold">
                <div className="space-y-1">
                  <div className="text-emerald-700 font-bold flex items-center">
                    <span className="mr-1">✓</span> Included
                  </div>
                  <ul className="list-disc list-inside text-slate-500 space-y-0.5 pl-1">
                    <li>Deduplicated tasks</li>
                    <li>Repetitive flag</li>
                    <li>Valid employee ID</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="text-rose-700 font-bold flex items-center">
                    <span className="mr-1">✗</span> Excluded
                  </div>
                  <ul className="list-disc list-inside text-slate-500 space-y-0.5 pl-1">
                    <li>Negative durations</li>
                    <li>Unknown employee IDs</li>
                    <li>Null salary records</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMethodology(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
