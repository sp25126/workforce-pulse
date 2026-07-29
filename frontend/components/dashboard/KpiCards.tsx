'use client';

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatINR } from '@/lib/formatters';
import { Clock, Zap, Wallet, Activity, Info, X, ShieldCheck } from 'lucide-react';

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
      color: "text-blue-600",
      bgColor: "bg-blue-50/80",
      borderGlow: "hover:border-blue-300",
      hasMethodology: false
    },
    {
      title: "Hours Recoverable",
      value: formatHours(hours_recoverable),
      description: "Potential hours saved via automation",
      icon: Zap,
      color: "text-amber-600",
      bgColor: "bg-amber-50/80",
      borderGlow: "hover:border-amber-300",
      hasMethodology: true
    },
    {
      title: "Cost Recoverable",
      value: formatINR(inr_recoverable),
      description: "Potential savings from automated workflows",
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/80",
      borderGlow: "hover:border-emerald-300",
      hasMethodology: true
    },
    {
      title: "Automation Potential",
      value: `${automation_potential_percent}%`,
      description: "Repetitive share of total working hours",
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50/80",
      borderGlow: "hover:border-purple-300",
      hasMethodology: false
    }
  ];

  return (
    <div className="space-y-4">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cardConfig.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className={`group bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-default ${card.borderGlow}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.color} transition-colors duration-200 shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {card.value}
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-2.5 leading-snug">{card.description}</p>
                {card.hasMethodology && (
                  <button
                    onClick={() => setShowMethodology(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1 mt-3.5 self-start cursor-pointer transition-colors duration-200"
                  >
                    <Info className="h-3 w-3" />
                    <span>View Methodology</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2.5">
                <Info className="h-4 w-4 text-blue-600" />
                <span>Headline Calculation Methodology</span>
              </h3>
              <button 
                onClick={() => setShowMethodology(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-sm text-slate-600">
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Formula Definitions</h4>
                <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl font-mono text-xs text-slate-700 leading-relaxed space-y-1">
                  <div>Recoverable hours = repetitive minutes × 0.6 ÷ 60</div>
                  <div>Recoverable INR = recoverable hours × hourly rate</div>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-slate-800 text-[10px] uppercase tracking-wider">Parameters & Yield</h4>
                <p className="leading-relaxed font-semibold text-xs text-slate-500">
                  We assume a <strong className="text-slate-700 font-bold">60% (0.6) automation yield factor</strong>, representing the expected productivity recovery rate when automating repetitive task categories.
                </p>
                <p className="leading-relaxed font-semibold text-xs text-slate-500">
                  Hourly compensation rates are pulled dynamically from the employee directory (converted from LPA where applicable).
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs font-semibold">
                <div className="space-y-1.5">
                  <div className="text-emerald-700 font-bold flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1 text-emerald-600" />
                    <span>Included</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-500 space-y-0.5 pl-1">
                    <li>Deduplicated tasks</li>
                    <li>Repetitive flag</li>
                    <li>Valid employee ID</li>
                  </ul>
                </div>
                <div className="space-y-1.5">
                  <div className="text-rose-700 font-bold flex items-center">
                    <span className="mr-1 text-rose-600 text-sm leading-none font-bold">✗</span>
                    <span>Excluded</span>
                  </div>
                  <ul className="list-disc list-inside text-slate-500 space-y-0.5 pl-1">
                    <li>Negative durations</li>
                    <li>Unknown employee IDs</li>
                    <li>Null salary records</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowMethodology(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
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
