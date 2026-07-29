'use client';

import React, { useState } from 'react';
import { useDashboard } from './DashboardContext';
import { AlertOctagon, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

export default function AnomalyCallouts() {
  const { data } = useDashboard();
  const [showAll, setShowAll] = useState(false);

  if (!data) return null;

  const { anomalies } = data;
  const featuredAnomaly = anomalies.length > 0 ? anomalies[0] : null;
  const remainingAnomalies = anomalies.slice(1);

  // Generate COO friendly executive reasoning
  const getCooReason = (item: typeof featuredAnomaly) => {
    if (!item) return "";
    
    // Extract minutes if present
    const minsMatch = item.description.match(/-?\d+/);
    const mins = minsMatch ? minsMatch[0] : "";
    
    if (item.type === "negative_duration") {
      return `Flagged system synchronization conflict or clock tampering: Employee ${item.employee_id} logged negative duration (${mins} min) for activity. Corrective system time sync auditing is recommended.`;
    }
    if (item.type === "outlier_duration") {
      return `Operational concentration outlier flagged: Employee ${item.employee_id} spent an unusually long task block (${mins} min) in a single session. This represents high process friction and potential manual bottleneck.`;
    }
    return `Data quality flag: ${item.description}. Refine input audit logs to prevent database reporting skew.`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
          <AlertOctagon className="h-5 w-5 text-rose-500" />
          <span>Operational Quality Audit</span>
        </h3>
        <span className="bg-rose-50 text-rose-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
          {anomalies.length} Flagged Outliers
        </span>
      </div>

      <div className="p-6 space-y-4 flex-1">
        {/* Empty State */}
        {!featuredAnomaly ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="text-emerald-500 text-3xl mb-2">✓</span>
            <p className="text-slate-500 text-sm font-semibold">Data validation pass. No operational quality anomalies detected.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Featured Hero Anomaly Card */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    Featured Outlier
                  </span>
                  <h3 className="text-sm font-bold text-slate-800">Employee {featuredAnomaly.employee_id}</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">{formatDate(featuredAnomaly.timestamp)}</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                {getCooReason(featuredAnomaly)}
              </p>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Flag type: {featuredAnomaly.type.toUpperCase().replace('_', ' ')}</span>
                <span>Reference ID: {featuredAnomaly.employee_id}</span>
              </div>
            </div>

            {/* Collapsible list of remaining anomalies */}
            {remainingAnomalies.length > 0 && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-all cursor-pointer"
                >
                  <span>{showAll ? 'Hide' : 'Show'} remaining quality audit flags ({remainingAnomalies.length})</span>
                  {showAll ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>

                {showAll && (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pt-2">
                    {remainingAnomalies.map((item, idx) => {
                      let Icon = HelpCircle;
                      let iconColor = "text-slate-500 bg-slate-50";
                      if (item.type === "negative_duration") {
                        Icon = AlertTriangle;
                        iconColor = "text-rose-500 bg-rose-50";
                      } else if (item.type === "outlier_duration") {
                        Icon = AlertOctagon;
                        iconColor = "text-amber-500 bg-amber-50";
                      }
                      
                      return (
                        <div key={idx} className="p-3 border border-slate-100 bg-slate-50/50 rounded-lg flex items-start space-x-2.5 text-xs font-medium text-slate-600">
                          <div className={`p-1 rounded ${iconColor} shrink-0 mt-0.5`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wide">
                                {item.type.replace('_', ' ')}
                              </span>
                              <span className="text-[10px] text-slate-400">{formatDate(item.timestamp)}</span>
                            </div>
                            <p className="font-semibold text-slate-700 leading-snug">{item.description}</p>
                            <span className="text-[9px] font-bold text-slate-400">Employee ID: {item.employee_id}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
