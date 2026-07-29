import { AggregatesResponse, FilterState } from "@/types/aggregates";

/**
 * Helper selector function to return normalized dashboard data slices.
 */
export function selectDashboardSlice(data: AggregatesResponse, filters: Partial<FilterState>) {
  return {
    headline: data.headline,
    weeklyTrend: data.weekly_trend,
    anomalies: data.anomalies,
    byDepartment: data.by_department,
    byTaskCategory: data.by_task_category,
  };
}
