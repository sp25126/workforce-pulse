'use client';

import React from 'react';
import { useDashboard } from '../dashboard/DashboardContext';
import { formatHours, formatCurrency } from '@/lib/formatters';
import { User, ShieldAlert, Clock, TrendingUp } from 'lucide-react';

export default function EmployeeDrilldown() {
  const { filters, data, unfilteredData, removeFilter } = useDashboard();

  if (!filters.employee_id) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="bg-slate-50 p-4 rounded-2xl text-slate-400 mb-4 border border-slate-100">
          <User className="h-7 w-7" />
        </div>
        <h4 className="font-bold text-slate-900 text-base">Select Employee</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-2 font-medium leading-relaxed">
          Select an employee from the dropdown filter or click an anomaly card to view person-level insights and department peer benchmarks.
        </p>
      </div>
    );
  }

  if (!data || !unfilteredData) return null;

  const empId = filters.employee_id;
  
  // 1. Get Employee Details
  const employeeHours = data.headline.total_hours;
  const employeePotential = data.headline.automation_potential_percent;

  // Extract department from current filtered views
  const empDept = data.by_department[0]?.department || "Unknown";
  
  // Find employee's anomalies
  const empAnomalies = data.anomalies.filter(a => a.employee_id === empId);

  // 2. Fetch Department Benchmarks from Unfiltered Data
  const deptBenchmark = unfilteredData.by_department.find(
    d => d.department.toLowerCase() === empDept.toLowerCase()
  );

  const deptTotalHours = deptBenchmark ? deptBenchmark.total_hours : 0;
  const deptPotential = deptBenchmark && deptBenchmark.total_hours > 0
    ? (deptBenchmark.hours_recoverable / deptBenchmark.total_hours) * 100
    : 0;

  // Compute Contribution
  const hourContribution = deptTotalHours > 0 
    ? (employeeHours / deptTotalHours) * 100 
    : 0;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 p-2 rounded-xl border border-blue-100">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Employee Drilldown</h3>
            <p className="text-xs font-semibold text-slate-500">ID: {empId} • {empDept}</p>
          </div>
        </div>
        <button
          onClick={() => removeFilter('employee_id')}
          className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          Exit Profile
        </button>
      </div>

      {/* Profile Insights Body */}
      <div className="p-5 md:p-6 space-y-6 flex-1 overflow-y-auto max-h-[460px]">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Tracked Time</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">{formatHours(employeeHours)}</span>
          </div>
          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5 text-center">
            <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Repetitive Share</span>
            <span className="text-xl font-extrabold text-amber-600 mt-1 block">{employeePotential}%</span>
          </div>
        </div>

        {/* Peer Benchmarks */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            <span>Department Benchmarks</span>
          </h4>
          
          <div className="space-y-3 bg-slate-50/60 p-4 border border-slate-200/60 rounded-xl">
            {/* Hour Share */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Time share in {empDept}</span>
                <span>{hourContribution.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-slate-200/70 rounded-full w-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${hourContribution}%` }}></div>
              </div>
            </div>

            {/* Potential comparison */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Automation potential vs Dept</span>
                <span>{employeePotential}% vs {Math.round(deptPotential)}%</span>
              </div>
              <div className="h-2 bg-slate-200/70 rounded-full w-full overflow-hidden flex">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${employeePotential}%` }}></div>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 mt-1 leading-snug">
                {employeePotential > deptPotential 
                  ? `▲ ${Math.round(employeePotential - deptPotential)}% higher repetitive tasks than department baseline.`
                  : `▼ ${Math.round(deptPotential - employeePotential)}% lower repetitive tasks than department baseline.`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Top Repetitive Tasks */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Top Repetitive Tasks</span>
          </h4>

          {data.by_task_category.filter(c => c.hours_recoverable > 0).length === 0 ? (
            <p className="text-slate-400 text-xs font-semibold bg-slate-50 p-4 rounded-xl text-center">
              No repetitive tasks logged for this employee.
            </p>
          ) : (
            <div className="space-y-2">
              {data.by_task_category
                .filter(c => c.hours_recoverable > 0)
                .slice(0, 3)
                .map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 bg-white shadow-2xs rounded-xl text-xs font-semibold">
                    <span className="text-slate-800 font-bold">{item.task_category}</span>
                    <span className="text-amber-700 font-extrabold">
                      {formatHours(item.hours_recoverable)} ({formatCurrency(item.inr_recoverable)})
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quality Alerts */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
            <span>Quality Flags ({empAnomalies.length})</span>
          </h4>
          
          {empAnomalies.length === 0 ? (
            <p className="text-emerald-700 text-xs font-bold bg-emerald-50/60 border border-emerald-100 p-3 rounded-xl text-center">
              ✓ No quality anomalies logged for this employee.
            </p>
          ) : (
            <div className="space-y-2">
              {empAnomalies.map((item, idx) => (
                <div key={idx} className="p-3 border border-rose-100 bg-rose-50/30 rounded-xl text-xs font-semibold text-slate-700 flex items-start space-x-2">
                  <span className="text-rose-600 font-extrabold shrink-0">•</span>
                  <span>{item.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
