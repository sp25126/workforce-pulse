'use client';

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours } from '@/lib/formatters';
import { BarChart3, AppWindow, Building, Check } from 'lucide-react';

export default function TimeSinkBreakdown() {
  const { data, filters, setFilters, removeFilter } = useDashboard();
  const [activeTab, setActiveTab] = useState<'tasks' | 'apps' | 'depts'>('tasks');
  if (!data) return null;

  const { by_task_category, by_app, by_department } = data;

  const maxTaskHours = by_task_category.length > 0 ? Math.max(...by_task_category.map(c => c.total_hours)) : 1;
  const maxAppHours = by_app.length > 0 ? Math.max(...by_app.map(a => a.total_hours)) : 1;
  const maxDeptHours = by_department.length > 0 ? Math.max(...by_department.map(d => d.total_hours)) : 1;

  const handleTaskClick = (taskCategory: string) => {
    if (filters.task_category === taskCategory) {
      removeFilter('task_category');
    } else {
      setFilters({ task_category: taskCategory });
    }
  };

  const handleDeptClick = (department: string) => {
    if (filters.department === department) {
      removeFilter('department');
    } else {
      setFilters({ department });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden">
      {/* Header and tab buttons */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <BarChart3 className="h-4.5 w-4.5 text-blue-600" />
            <span>Work Activity Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Click categories or departments to filter dashboard</p>
        </div>
        
        {/* Tabs switcher */}
        <div className="bg-slate-100/90 p-1 rounded-xl flex self-start sm:self-auto border border-slate-200/50">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'tasks' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'apps' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <AppWindow className="h-3.5 w-3.5" />
            <span>Apps</span>
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
              activeTab === 'depts' 
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Depts</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 md:p-6 flex-1 overflow-y-auto max-h-[380px] space-y-2">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-2.5">
            {by_task_category.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold text-center py-10">No task category data found matching active filter.</p>
            ) : (
              by_task_category.map((item, idx) => {
                const repPercent = (item.hours_recoverable / item.total_hours) * 100;
                const widthPercent = (item.total_hours / maxTaskHours) * 100;
                const isSelected = filters.task_category === item.task_category;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleTaskClick(item.task_category)}
                    className={`space-y-2 p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                      isSelected 
                        ? 'bg-blue-50/60 border-blue-200 shadow-xs ring-1 ring-blue-500/20' 
                        : 'border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center space-x-1.5 truncate pr-2">
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{item.task_category}</span>
                      </span>
                      <span className="text-slate-500 font-semibold shrink-0">
                        {formatHours(item.total_hours)} 
                        {item.hours_recoverable > 0 && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 rounded-md px-1.5 py-0.5 ml-2 font-bold inline-block">
                            {formatHours(item.hours_recoverable)} rec.
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Visual Stacked bar */}
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex w-full">
                      {/* Repetitive/Recoverable part */}
                      {item.hours_recoverable > 0 && (
                        <div 
                          className="bg-amber-400 h-full transition-all duration-300 rounded-l-full" 
                          style={{ width: `${widthPercent * (repPercent / 100)}%` }}
                        />
                      )}
                      {/* Non-repetitive part */}
                      <div 
                        className={`bg-blue-500 h-full transition-all duration-300 ${item.hours_recoverable === 0 ? 'rounded-full' : 'rounded-r-full'}`} 
                        style={{ width: `${widthPercent * ((100 - repPercent) / 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Apps Tab */}
        {activeTab === 'apps' && (
          <div className="space-y-2.5">
            {by_app.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold text-center py-10">No application data found matching active filter.</p>
            ) : (
              by_app.map((item, idx) => {
                const widthPercent = (item.total_hours / maxAppHours) * 100;
                return (
                  <div key={idx} className="space-y-2 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/60 transition-all duration-150">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 font-bold text-xs sm:text-sm">{item.app_used}</span>
                      <span className="text-slate-500 font-semibold">{formatHours(item.total_hours)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                      <div 
                        className="bg-slate-400 h-full rounded-full transition-all duration-300" 
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'depts' && (
          <div className="space-y-2.5">
            {by_department.length === 0 ? (
              <p className="text-slate-400 text-xs font-semibold text-center py-10">No department data found matching active filter.</p>
            ) : (
              by_department.map((item, idx) => {
                const widthPercent = (item.total_hours / maxDeptHours) * 100;
                const isSelected = filters.department === item.department;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDeptClick(item.department)}
                    className={`space-y-2 p-3 rounded-xl cursor-pointer transition-all duration-150 border ${
                      isSelected 
                        ? 'bg-purple-50/60 border-purple-200 shadow-xs ring-1 ring-purple-500/20' 
                        : 'border-slate-100 hover:border-slate-200/80 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 flex items-center space-x-1.5">
                        {isSelected && <Check className="h-3.5 w-3.5 text-purple-600 shrink-0" />}
                        <span className="font-bold text-xs sm:text-sm text-slate-900">{item.department}</span>
                      </span>
                      <span className="text-slate-500 font-semibold">{formatHours(item.total_hours)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-full">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelected ? 'bg-purple-600' : 'bg-purple-500'
                        }`} 
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* Legend footer */}
      {activeTab === 'tasks' && by_task_category.length > 0 && (
        <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 rounded-b-2xl flex items-center space-x-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-xs"></div>
            <span>Standard Workflow</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-xs"></div>
            <span>Repetitive Task</span>
          </div>
        </div>
      )}
    </div>
  );
}
