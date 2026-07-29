'use client';

import React from 'react';
import { useDashboard } from '../dashboard/DashboardContext';
import { formatHours, formatINR, formatDate } from '@/lib/formatters';

export default function ExecutiveSummary() {
  const { data, filters } = useDashboard();
  if (!data) return null;

  const { total_hours, hours_recoverable, inr_recoverable, automation_potential_percent } = data.headline;
  const { automation_ranking } = data;

  // Active filters helper labels
  const getFilterSummary = () => {
    const list = [];
    if (filters.department) list.push(`Department: ${filters.department}`);
    if (filters.task_category) list.push(`Category: ${filters.task_category}`);
    if (filters.employee_id) list.push(`Employee: ${filters.employee_id}`);
    if (filters.week) list.push(`Week: ${filters.week}`);
    return list.length > 0 ? list.join(' • ') : 'All Data (No Filters)';
  };

  return (
    <div 
      id="executive-summary" 
      className="bg-white text-slate-800 p-8 w-[800px] border border-slate-200 font-sans space-y-6 select-none relative"
      style={{ position: 'fixed', left: '-9999px', top: '-9999px', zIndex: -100 }}
    >
      {/* Title Header */}
      <div className="border-b-2 border-slate-800 pb-4.5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Workforce Pulse</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Executive Summary Report</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Generated On</p>
          <p className="text-xs font-bold text-slate-700">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Audit Scope / Meta Context */}
      <div className="bg-slate-50 border border-slate-150 rounded-lg p-3.5 flex items-center justify-between text-xs font-semibold">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Scope of Analysis</span>
          <span className="text-slate-700 font-bold text-sm mt-0.5 block">{getFilterSummary()}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Date Range Captured</span>
          <span className="text-slate-700 font-bold block mt-0.5">Oct 06, 2025 – Oct 24, 2025</span>
        </div>
      </div>

      {/* Main KPI Figures Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Tracked Hours</span>
          <span className="text-lg font-black text-slate-800 mt-1 block">{formatHours(total_hours)}</span>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 text-center bg-blue-50/10">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Recoverable Hours</span>
          <span className="text-lg font-black text-blue-600 mt-1 block">{formatHours(hours_recoverable)}</span>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 text-center bg-emerald-50/10">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Cost Recoverable</span>
          <span className="text-lg font-black text-emerald-600 mt-1 block">{formatINR(inr_recoverable)}</span>
        </div>
        <div className="border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Waste Potential</span>
          <span className="text-lg font-black text-slate-800 mt-1 block">{automation_potential_percent}%</span>
        </div>
      </div>

      {/* Top 5 Opportunities Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
          Top Automation Opportunities (Ranked by ROI)
        </h3>
        
        {automation_ranking.length === 0 ? (
          <p className="text-slate-400 text-xs font-semibold py-4 text-center">No automation opportunities detected in current scope.</p>
        ) : (
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-200">
                <th className="py-2.5 px-3 w-10">Rank</th>
                <th className="py-2.5 px-2">Task Category</th>
                <th className="py-2.5 px-2 w-28 text-right">Rec. Hours</th>
                <th className="py-2.5 px-2 w-32 text-right">Rec. Cost (INR)</th>
                <th className="py-2.5 px-3 w-52">Primary Driver</th>
              </tr>
            </thead>
            <tbody>
              {automation_ranking.slice(0, 5).map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                  <td className="py-3 px-3 font-extrabold text-slate-500">#{idx + 1}</td>
                  <td className="py-3 px-2 font-bold text-slate-850">{item.task_category}</td>
                  <td className="py-3 px-2 font-semibold text-right text-slate-700">{formatHours(item.hours_recoverable)}</td>
                  <td className="py-3 px-2 font-bold text-right text-slate-800">{formatINR(item.inr_recoverable)}</td>
                  <td className="py-3 px-3 text-[11px] font-semibold text-slate-500 leading-snug">{item.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Data Quality / Flag Alerts */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
          Data Quality Flags & Anomalies
        </h3>
        {data.anomalies.length === 0 ? (
          <p className="text-emerald-700 bg-emerald-50/30 border border-emerald-100/50 p-2.5 rounded-lg text-[11px] font-bold text-center">
            ✓ Clean Audit: Zero data quality anomalies detected under current filters.
          </p>
        ) : (
          <div className="space-y-1.5">
            {data.anomalies.slice(0, 2).map((item, idx) => (
              <div key={idx} className="p-2.5 border border-slate-200/60 bg-slate-50/40 rounded-lg text-[11px] font-medium text-slate-600 flex justify-between items-center">
                <span className="font-semibold text-slate-700">{item.description}</span>
                <span className="font-bold text-[9px] bg-slate-100 border border-slate-200/50 text-slate-500 rounded px-1.5 py-0.5 uppercase shrink-0 ml-4">
                  {item.type.replace('_', ' ')}
                </span>
              </div>
            ))}
            {data.anomalies.length > 2 && (
              <p className="text-[10px] font-bold text-slate-400 pl-1">
                + {data.anomalies.length - 2} other data validation flags omitted from summary.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Methodology note Footer */}
      <div className="border-t border-slate-200 pt-4 flex justify-between items-start text-[10px] font-semibold text-slate-400">
        <div className="max-w-[480px] leading-relaxed">
          <span className="font-extrabold text-slate-500 uppercase tracking-wider block mb-0.5">Methodology & Formula Notes</span>
          <p>
            Recoverable hours are calculated assuming a standard <strong className="text-slate-500 font-bold">60% (0.6) automation yield factor</strong> on validated repetitive work.
          </p>
          <p className="mt-0.5">
            Recoverable INR calculations utilize individual hourly compensation rates derived from the Canonical employee compensation index.
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-500 uppercase tracking-wider">Workforce Pulse Audit</p>
          <p className="mt-0.5">Confidential • For Internal Leadership Review Only</p>
        </div>
      </div>
    </div>
  );
}
