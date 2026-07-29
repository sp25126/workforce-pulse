'use client';

import React from 'react';
import { DashboardProvider, useDashboard } from '@/components/dashboard/DashboardContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import KpiCards from '@/components/dashboard/KpiCards';
import TimeSinkBreakdown from '@/components/dashboard/TimeSinkBreakdown';
import AutomationRanking from '@/components/dashboard/AutomationRanking';
import WeeklyTrend from '@/components/dashboard/WeeklyTrend';
import AnomalyCallouts from '@/components/dashboard/AnomalyCallouts';
import LoadingSkeleton from '@/components/dashboard/LoadingSkeleton';
import EmployeeDrilldown from '@/components/drilldown/EmployeeDrilldown';
import AssistantPanel from '@/components/dashboard/AssistantPanel';
import ExecutiveSummary from '@/components/export/ExecutiveSummary';
import { AlertCircle, Terminal } from 'lucide-react';

function DashboardContent() {
  const { data, loading, error, refresh } = useDashboard();

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto my-12 space-y-5">
        <div className="bg-rose-50 p-3 rounded-2xl text-rose-500 w-12 h-12 flex items-center justify-center mx-auto border border-rose-100">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-lg">Connection Failed</h3>
          <p className="text-xs font-semibold text-slate-500 px-4 leading-relaxed">
            {error}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 font-mono text-[11px] text-slate-600 text-left flex items-start space-x-2">
          <Terminal className="h-4 w-4 shrink-0 mt-0.5 text-slate-500" />
          <span>
            Check that the FastAPI backend server is running and accessible at: 
            <br />
            <code className="text-slate-900 font-bold">{process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}</code>
          </span>
        </div>
        <button
          onClick={refresh}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Header Filters */}
      <DashboardHeader />

      {/* 2. Content Sections */}
      {loading && !data ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* 3. KPI Cards Section */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Executive Summary</h2>
              <span className="text-[10px] font-bold text-slate-400">Audited dataset: Oct 06 – Oct 24, 2025</span>
            </div>
            <KpiCards />
          </section>

          {/* 4. Work Activity Breakdown & Employee Drilldown */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Workload Allocation & Drilldown</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <TimeSinkBreakdown />
              </div>
              <div className="lg:col-span-2">
                <EmployeeDrilldown />
              </div>
            </div>
          </section>

          {/* 5. Weekly Trend & Automation Opportunities */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Strategic Trends & Automation Opportunities</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <WeeklyTrend />
              </div>
              <div className="lg:col-span-2">
                <AutomationRanking />
              </div>
            </div>
          </section>

          {/* 6. Activity Flags & Grounded AI Assistant */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Data Quality Audit & Intelligence</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <AnomalyCallouts />
              </div>
              <div className="lg:col-span-2">
                <AssistantPanel />
              </div>
            </div>
          </section>

          {/* Hidden Executive Summary Export Target */}
          <ExecutiveSummary />
        </>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </DashboardProvider>
  );
}
