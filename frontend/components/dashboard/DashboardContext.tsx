'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AggregatesResponse, FilterState } from '@/types/aggregates';
import { getAggregates } from '@/lib/api';

interface MetaOptions {
  departments: string[];
  categories: string[];
  employees: string[];
  weeks: string[];
}

interface DashboardContextType {
  filters: Partial<FilterState>;
  setFilters: (filters: Partial<FilterState>) => void;
  data: AggregatesResponse | null;
  loading: boolean;
  error: string | null;
  metaOptions: MetaOptions;
  refresh: () => void;
  clearFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// Hardcoded baseline options for dropdown menus before dynamic parsing completes
const FALLBACK_EMPLOYEES = ["E001", "E002", "E003", "E005", "E006", "E007", "E010", "E011", "E012", "E013", "E014", "E015", "E099"];
const FALLBACK_DEPARTMENTS = ["Operations", "Sales", "HR", "Marketing", "Finance", "Customer Support", "metadata_missing"];

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<Partial<FilterState>>({});
  const [data, setData] = useState<AggregatesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [metaOptions, setMetaOptions] = useState<MetaOptions>({
    departments: FALLBACK_DEPARTMENTS,
    categories: [],
    employees: FALLBACK_EMPLOYEES,
    weeks: []
  });

  const [initialLoaded, setInitialLoaded] = useState(false);

  const fetchDashboardData = async (currentFilters: Partial<FilterState>, isInitial = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAggregates(currentFilters);
      setData(response);

      // Populate filters dropdown options from the unfiltered response on initial load
      if (isInitial || !initialLoaded) {
        const departments = response.by_department.map(d => d.department)
          .filter((v, i, a) => a.indexOf(v) === i && v !== "metadata_missing");
        const categories = response.by_task_category.map(c => c.task_category)
          .filter((v, i, a) => a.indexOf(v) === i && v !== "Unknown");
        const weeks = response.weekly_trend.map(w => w.week_start);
        
        // Extract unique employees from anomalies and seed reports
        const employees = response.anomalies.map(a => a.employee_id)
          .concat(FALLBACK_EMPLOYEES)
          .filter((v, i, a) => a.indexOf(v) === i && v);

        setMetaOptions({
          departments: departments.length > 0 ? departments : FALLBACK_DEPARTMENTS,
          categories,
          employees,
          weeks
        });
        setInitialLoaded(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard data. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(filters, Object.keys(filters).length === 0);
  }, [filters]);

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState({});
  };

  const refresh = () => {
    fetchDashboardData(filters);
  };

  return (
    <DashboardContext.Provider value={{
      filters,
      setFilters,
      data,
      loading,
      error,
      metaOptions,
      refresh,
      clearFilters
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
