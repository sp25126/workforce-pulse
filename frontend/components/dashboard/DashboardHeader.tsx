'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { RefreshCw, FilterX, X, SlidersHorizontal } from 'lucide-react';
import { FilterState } from '@/types/aggregates';
import ExportButton from '../export/ExportButton';

export default function DashboardHeader() {
  const { filters, setFilters, removeFilter, metaOptions, loading, refresh, clearFilters } = useDashboard();

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    setFilters({ [key]: value || undefined });
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const getFilterLabel = (key: keyof FilterState, value: string) => {
    switch (key) {
      case 'department': return `Dept: ${value}`;
      case 'task_category': return `Category: ${value}`;
      case 'employee_id': return `Employee: ${value}`;
      case 'week': return `Week: ${value}`;
      default: return value;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      {/* Header top controls row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filters selectors */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 items-center flex-1">
          <div className="hidden sm:flex items-center space-x-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          {/* Department Filter */}
          <div className="flex flex-col min-w-[130px] flex-1 sm:flex-none">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Department</label>
            <select
              value={filters.department || ''}
              onChange={(e) => handleSelectChange('department', e.target.value)}
              className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              {metaOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Task Category Filter */}
          <div className="flex flex-col min-w-[130px] flex-1 sm:flex-none">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Task Category</label>
            <select
              value={filters.task_category || ''}
              onChange={(e) => handleSelectChange('task_category', e.target.value)}
              className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {metaOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Employee ID Filter */}
          <div className="flex flex-col min-w-[120px] flex-1 sm:flex-none">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Employee ID</label>
            <select
              value={filters.employee_id || ''}
              onChange={(e) => handleSelectChange('employee_id', e.target.value)}
              className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Employees</option>
              {metaOptions.employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Week Filter */}
          <div className="flex flex-col min-w-[120px] flex-1 sm:flex-none">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">Week Starting</label>
            <select
              value={filters.week || ''}
              onChange={(e) => handleSelectChange('week', e.target.value)}
              className="bg-slate-50/80 hover:bg-slate-100/70 border border-slate-200/90 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Weeks</option>
              {metaOptions.weeks.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-600 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <FilterX className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100/80 border border-blue-200/70 rounded-xl transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <ExportButton />
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">Context Active:</span>
          {Object.entries(filters).map(([key, val]) => {
            if (!val) return null;
            return (
              <div 
                key={key} 
                className="bg-blue-50/90 border border-blue-200/80 text-blue-800 font-bold text-xs pl-3 pr-1.5 py-1 rounded-lg flex items-center space-x-1.5 shadow-2xs transition-all"
              >
                <span>{getFilterLabel(key as keyof FilterState, val)}</span>
                <button 
                  onClick={() => removeFilter(key as keyof FilterState)}
                  className="hover:bg-blue-200/60 p-0.5 rounded-full text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
