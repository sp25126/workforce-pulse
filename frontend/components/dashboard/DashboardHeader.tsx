'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { RefreshCw, FilterX, X } from 'lucide-react';
import { FilterState } from '@/types/aggregates';

export default function DashboardHeader() {
  const { filters, setFilters, removeFilter, metaOptions, loading, refresh, clearFilters } = useDashboard();

  const handleSelectChange = (key: keyof FilterState, value: string) => {
    setFilters({ [key]: value || undefined });
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  // Format filter values for chips
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
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filters selectors */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Department Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Department</label>
            <select
              value={filters.department || ''}
              onChange={(e) => handleSelectChange('department', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Departments</option>
              {metaOptions.departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Task Category Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Task Category</label>
            <select
              value={filters.task_category || ''}
              onChange={(e) => handleSelectChange('task_category', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {metaOptions.categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Employee ID Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Employee ID</label>
            <select
              value={filters.employee_id || ''}
              onChange={(e) => handleSelectChange('employee_id', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Employees</option>
              {metaOptions.employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          {/* Week Filter */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">Week starting</label>
            <select
              value={filters.week || ''}
              onChange={(e) => handleSelectChange('week', e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="">All Weeks</option>
              {metaOptions.weeks.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2 pt-2 md:pt-0">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer"
            >
              <FilterX className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Display */}
      {hasActiveFilters && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Active Filters:</span>
          {Object.entries(filters).map(([key, val]) => {
            if (!val) return null;
            return (
              <div 
                key={key} 
                className="bg-blue-50 border border-blue-100 text-blue-700 font-bold text-xs pl-2.5 pr-1 py-1 rounded-full flex items-center space-x-1.5 shadow-sm"
              >
                <span>{getFilterLabel(key as keyof FilterState, val)}</span>
                <button 
                  onClick={() => removeFilter(key as keyof FilterState)}
                  className="hover:bg-blue-150 p-0.5 rounded-full text-blue-500 hover:text-blue-700 transition-all cursor-pointer"
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
