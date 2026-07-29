'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatCurrency } from '@/lib/formatters';
import { CalendarRange, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function WeeklyTrend() {
  const { data } = useDashboard();
  if (!data) return null;

  const { weekly_trend } = data;

  if (weekly_trend.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6 flex flex-col h-full items-center justify-center min-h-[260px]">
        <p className="text-slate-400 text-sm font-semibold">No weekly trend data available.</p>
      </div>
    );
  }

  // 1. Calculate four-week movement
  const firstWeek = weekly_trend[0];
  const lastWeek = weekly_trend[weekly_trend.length - 1];
  
  const firstShare = firstWeek.total_hours > 0 ? (firstWeek.hours_recoverable / firstWeek.total_hours) * 100 : 0;
  const lastShare = lastWeek.total_hours > 0 ? (lastWeek.hours_recoverable / lastWeek.total_hours) * 100 : 0;
  const shareDelta = lastShare - firstShare;

  const trendNarrative = weekly_trend.length >= 2 
    ? `${shareDelta >= 0 ? 'Increase' : 'Reduction'} of ${Math.abs(shareDelta).toFixed(1)}% in repetitive task share over the last ${weekly_trend.length} weeks.`
    : "Baseline trend data loaded.";

  // SVG Chart Config
  const height = 180;
  const width = 500;
  const paddingLeft = 45;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 10;

  const graphHeight = height - paddingTop - paddingBottom;
  const graphWidth = width - paddingLeft - paddingRight;

  const maxHours = Math.max(...weekly_trend.map(w => w.total_hours), 10);
  const yTicks = [0, maxHours / 2, maxHours];

  const colWidth = graphWidth / weekly_trend.length;
  const barWidth = Math.min(colWidth * 0.35, 20);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
      {/* Chart Header */}
      <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/20">
        <div className="space-y-0.5">
          <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
            <CalendarRange className="h-5 w-5 text-blue-500" />
            <span>Weekly Activity & Waste Trend</span>
          </h3>
          <p className="text-xs font-semibold text-slate-500 flex items-center">
            {shareDelta >= 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-amber-500 mr-0.5 shrink-0" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500 mr-0.5 shrink-0" />
            )}
            <span>{trendNarrative}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded bg-blue-500 shadow-sm"></div>
            <span>Total Time</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="h-2.5 w-2.5 rounded bg-amber-400 shadow-sm"></div>
            <span>Repetitive (Waste)</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        <div className="w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full min-w-[320px] max-w-[500px] mx-auto overflow-visible"
            height={height}
          >
            {/* Grid Y-Lines & Labels */}
            {yTicks.map((tick, idx) => {
              const y = height - paddingBottom - (tick / maxHours) * graphHeight;
              return (
                <g key={idx}>
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    className="stroke-slate-100 stroke-1"
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={y + 3.5} 
                    textAnchor="end" 
                    className="fill-slate-400 font-bold text-[9px] tracking-wide"
                  >
                    {Math.round(tick)} hrs
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {weekly_trend.map((item, idx) => {
              const xCenter = paddingLeft + (idx * colWidth) + (colWidth / 2);
              const xBar = xCenter - (barWidth / 2);
              
              const totalBarHeight = (item.total_hours / maxHours) * graphHeight;
              const repBarHeight = (item.hours_recoverable / maxHours) * graphHeight;
              
              const yTotal = height - paddingBottom - totalBarHeight;
              const yRep = height - paddingBottom - repBarHeight;

              // Extract date parsing format
              let displayDate = item.week_start;
              try {
                const date = new Date(item.week_start);
                displayDate = date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
              } catch {}

              return (
                <g key={idx} className="group cursor-pointer">
                  {/* Total Hours Bar (Background) */}
                  <rect 
                    x={xBar} 
                    y={yTotal} 
                    width={barWidth} 
                    height={totalBarHeight} 
                    rx="3" 
                    className="fill-blue-500/80 group-hover:fill-blue-500 transition-all duration-300"
                  />
                  {/* Recoverable Hours Bar (Stacked Overlay) */}
                  {repBarHeight > 0 && (
                    <rect 
                      x={xBar} 
                      y={yRep} 
                      width={barWidth} 
                      height={repBarHeight} 
                      rx="3" 
                      className="fill-amber-400 group-hover:fill-amber-500 transition-all duration-300"
                    />
                  )}

                  {/* Tooltip text */}
                  <title>
                    {`Week of ${item.week_start}\nTotal Time: ${formatHours(item.total_hours)}\nWaste/Repetitive: ${formatHours(item.hours_recoverable)} (${formatCurrency(item.inr_recoverable)})`}
                  </title>

                  {/* X-axis date labels */}
                  <text 
                    x={xCenter} 
                    y={height - 8} 
                    textAnchor="middle" 
                    className="fill-slate-500 font-bold text-[9px] uppercase tracking-wide"
                  >
                    {displayDate}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
