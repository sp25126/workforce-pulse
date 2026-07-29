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
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      {/* Header and tab buttons */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          <span>Work Activity Breakdown</span>
        </h3>
        
        {/* Tabs switcher */}
        <div className="bg-slate-100 p-0.5 rounded-lg flex self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'tasks' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Task Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'apps' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <AppWindow className="h-3.5 w-3.5" />
            <span>Apps Used</span>
          </button>
          <button
            onClick={() => setActiveTab('depts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${activeTab === 'depts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Building className="h-3.5 w-3.5" />
            <span>Departments</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 overflow-y-auto max-h-[360px]">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {by_task_category.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 font-medium">No task category data found matching filter.</p>
            ) : (
              by_task_category.map((item, idx) => {
                const repPercent = (item.hours_recoverable / item.total_hours) * 100;
                const widthPercent = (item.total_hours / maxTaskHours) * 100;
                const isSelected = filters.task_category === item.task_category;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleTaskClick(item.task_category)}
                    className={`space-y-1.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all border ${
                      isSelected ? 'bg-blue-50/50 border-blue-200 hover:bg-blue-50' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-700 flex items-center space-x-1.5">
                        {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                        <span>{item.task_category}</span>
                      </span>
                      <span className="text-slate-500">
                        {formatHours(item.total_hours)} 
                        {item.hours_recoverable > 0 && (
                          <span className="text-xs text-amber-500 ml-1">
                            ({formatHours(item.hours_recoverable)} recoverable)
                          </span>
                        )}
                      </span>
                    </div>
                    {/* Visual Stacked bar */}
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex w-full">
                      {/* Repetitive/Recoverable part */}
                      {item.hours_recoverable > 0 && (
                        <div 
                          className="bg-amber-400 h-full transition-all" 
                          style={{ width: `${widthPercent * (repPercent / 100)}%` }}
                        />
                      )}
                      {/* Non-repetitive part */}
                      <div 
                        className="bg-blue-500 h-full transition-all" 
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
          <div className="space-y-4">
            {by_app.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 font-medium">No application data found matching filter.</p>
            ) : (
              by_app.map((item, idx) => {
                const widthPercent = (item.total_hours / maxAppHours) * 100;
                return (
                  <div key={idx} className="space-y-1.5 p-2 border border-transparent rounded-lg">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-700">{item.app_used}</span>
                      <span className="text-slate-500">{formatHours(item.total_hours)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
                      <div 
                        className="bg-slate-400 h-full rounded-full transition-all" 
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
          <div className="space-y-4">
            {by_department.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-10 font-medium">No department data found matching filter.</p>
            ) : (
              by_department.map((item, idx) => {
                const widthPercent = (item.total_hours / maxDeptHours) * 100;
                const isSelected = filters.department === item.department;

                return (
                  <div 
                    key={idx} 
                    onClick={() => handleDeptClick(item.department)}
                    className={`space-y-1.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-all border ${
                      isSelected ? 'bg-purple-50/50 border-purple-200 hover:bg-purple-50' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span className="text-slate-700 flex items-center space-x-1.5">
                        {isSelected && <Check className="h-4 w-4 text-purple-600" />}
                        <span>{item.department}</span>
                      </span>
                      <span className="text-slate-500">{formatHours(item.total_hours)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden w-full">
                      <div 
                        className={`h-full rounded-full transition-all ${
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
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg flex items-center space-x-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
            <span>Standard Workflow</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
            <span>Repetitive Task (Recoverable)</span>
          </div>
        </div>
      )}
    </div>
  );
}
