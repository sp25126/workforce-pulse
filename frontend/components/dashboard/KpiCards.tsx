'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatCurrency } from '@/lib/formatters';
import { Clock, Zap, Wallet, Activity } from 'lucide-react';

export default function KpiCards() {
  const { data } = useDashboard();
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
      borderColor: "border-blue-100"
    },
    {
      title: "Hours Recoverable",
      value: formatHours(hours_recoverable),
      description: "Potential hours saved from repetitive tasks",
      icon: Zap,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100"
    },
    {
      title: "Cost Recoverable",
      value: formatCurrency(inr_recoverable),
      description: "Potential savings from automated workflows",
      icon: Wallet,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100"
    },
    {
      title: "Automation Potential",
      value: `${automation_potential_percent}%`,
      description: "Repetitive share of total working hours",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-slate-500 tracking-tight">{card.title}</span>
              <div className={`p-2 rounded-full ${card.bgColor} ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-800 leading-none">{card.value}</div>
              <p className="text-xs text-slate-400 mt-2 font-medium">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
