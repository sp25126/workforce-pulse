export interface Headline {
  total_hours: number;
  hours_recoverable: number;
  inr_recoverable: number;
  automation_potential_percent: number;
}

export interface TaskCategoryBreakdown {
  task_category: string;
  total_hours: number;
  hours_recoverable: number;
  inr_recoverable: number;
  automation_potential_percent: number;
}

export interface AppBreakdown {
  app_used: string;
  total_hours: number;
  hours_recoverable: number;
  inr_recoverable: number;
}

export interface DepartmentBreakdown {
  department: string;
  total_hours: number;
  hours_recoverable: number;
  inr_recoverable: number;
}

export interface AutomationRanking {
  task_category: string;
  score: number;
  hours_recoverable: number;
  inr_recoverable: number;
  reason: string;
}

export interface WeeklyTrend {
  week_start: string;
  total_hours: number;
  hours_recoverable: number;
  inr_recoverable: number;
}

export interface Anomaly {
  id: number;
  employee_id: string;
  timestamp: string;
  type: "negative_duration" | "missing_duration" | "outlier_duration";
  description: string;
}

export interface FilterState {
  department: string;
  task_category: string;
  employee_id: string;
  week: string;
}

export interface AggregatesResponse {
  headline: Headline;
  by_task_category: TaskCategoryBreakdown[];
  by_app: AppBreakdown[];
  by_department: DepartmentBreakdown[];
  automation_ranking: AutomationRanking[];
  weekly_trend: WeeklyTrend[];
  anomalies: Anomaly[];
  meta: {
    total_records: number;
    filtered_records: number;
    date_range: {
      start: string | null;
      end: string | null;
    } | null;
    filters: Partial<FilterState>;
  };
}
