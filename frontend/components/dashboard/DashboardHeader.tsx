'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { RefreshCw, FilterX } from 'lucide-react';

export default function DashboardHeader() {
  const { filters, setFilters, metaOptions, loading, refresh, clearFilters } = useDashboard();

  const handleSelectChange = (key: string, value: string) => {
    setFilters({ [key]: value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
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
      <div className="flex items-center space-x-2 pt-4 md:pt-0">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded transition-all cursor-pointer"
          >
            <FilterX className="h-4 w-4" />
            <span>Reset</span>
          </button>
        )}
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
