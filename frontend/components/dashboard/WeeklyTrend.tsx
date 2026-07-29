'use client';

import React from 'react';
import { useDashboard } from './DashboardContext';
import { formatHours, formatCurrency } from '@/lib/formatters';
import { CalendarRange } from 'lucide-react';

export default function WeeklyTrend() {
  const { data } = useDashboard();
  if (!data) return null;

  const { weekly_trend } = data;

  if (weekly_trend.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex flex-col h-full items-center justify-center min-h-[260px]">
        <p className="text-slate-400 text-sm font-medium">No trend data available.</p>
      </div>
    );
  }

  // SVG Chart Config
  const height = 180;
  const width = 500;
  const paddingLeft = 35;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 10;

  const graphHeight = height - paddingTop - paddingBottom;
  const graphWidth = width - paddingLeft - paddingRight;

  const maxHours = Math.max(...weekly_trend.map(w => w.total_hours), 10);
  const yTicks = [0, maxHours / 2, maxHours];

  const colWidth = graphWidth / weekly_trend.length;
  const barWidth = Math.min(colWidth * 0.5, 30);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <CalendarRange className="h-5 w-5 text-blue-500" />
          <span>Weekly Activity Trend</span>
        </h3>
        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-1">
            <div className="h-2.5 w-2.5 rounded bg-blue-500"></div>
            <span>Total Hours</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2.5 w-2.5 rounded bg-amber-400"></div>
            <span>Recoverable</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-center">
        {/* Responsive SVG wrapper */}
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
                    y={y + 4} 
                    textAnchor="end" 
                    className="fill-slate-400 font-semibold text-[10px]"
                  >
                    {Math.round(tick)}h
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
                // e.g. "Oct 06"
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
                    className="fill-blue-500/80 group-hover:fill-blue-500 transition-all"
                  />
                  {/* Recoverable Hours Bar (Stacked Overlay) */}
                  {repBarHeight > 0 && (
                    <rect 
                      x={xBar} 
                      y={yRep} 
                      width={barWidth} 
                      height={repBarHeight} 
                      rx="3" 
                      className="fill-amber-400 group-hover:fill-amber-500 transition-all"
                    />
                  )}

                  {/* Tooltip text (invisible on default, show on hover) */}
                  <title>
                    {`Week of ${item.week_start}\nTotal: ${formatHours(item.total_hours)}\nRecoverable: ${formatHours(item.hours_recoverable)} (${formatCurrency(item.inr_recoverable)})`}
                  </title>

                  {/* X-axis date labels */}
                  <text 
                    x={xCenter} 
                    y={height - 8} 
                    textAnchor="middle" 
                    className="fill-slate-500 font-semibold text-[10px]"
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
