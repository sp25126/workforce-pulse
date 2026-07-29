from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Dict, Any
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from app.core.config import settings

router = APIRouter()

def get_db_engine():
    return create_engine(settings.DATABASE_URL)

@router.get("/")
def get_aggregates(
    department: Optional[str] = Query(None, description="Filter by department"),
    task_category: Optional[str] = Query(None, description="Filter by task category"),
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    week: Optional[str] = Query(None, description="Filter by week start date (YYYY-MM-DD)")
):
    try:
        engine = get_db_engine()
        # Load all joined activity data from DB
        df = pd.read_sql("SELECT * FROM joined_activity", con=engine)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection error: {str(e)}"
        )

    if df.empty:
        return {
            "headline": {"total_hours": 0.0, "hours_recoverable": 0.0, "inr_recoverable": 0.0, "automation_potential_percent": 0.0},
            "by_task_category": [],
            "by_app": [],
            "by_department": [],
            "automation_ranking": [],
            "weekly_trend": [],
            "anomalies": [],
            "meta": {"total_records": 0, "filtered_records": 0, "date_range": None, "filters": {}}
        }

    # Ensure timestamps are parsed
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    
    # Calculate billing/hourly rates for each row
    # Default to 0.0 if not specified
    df["effective_hourly_rate"] = 0.0
    
    # If hourly rate is directly present
    has_hourly = df["hourly_rate_inr"].notna()
    df.loc[has_hourly, "effective_hourly_rate"] = df.loc[has_hourly, "hourly_rate_inr"]
    
    # If annual CTC is present and hourly rate is not
    has_ctc_only = df["annual_ctc_inr"].notna() & df["hourly_rate_inr"].isna()
    # Assume 2080 standard working hours annually (8 hrs * 5 days * 52 weeks)
    df.loc[has_ctc_only, "effective_hourly_rate"] = df.loc[has_ctc_only, "annual_ctc_inr"] / 2080.0
    
    # Total row duration in hours
    df["duration_hours"] = df["duration_minutes"] / 60.0
    
    # Calculate recoverable cost
    df["recoverable_inr"] = 0.0
    is_rep = df["is_repetitive"] == True
    df.loc[is_rep, "recoverable_inr"] = df.loc[is_rep, "duration_hours"] * df.loc[is_rep, "effective_hourly_rate"]

    # Save metadata counts before filters
    total_records = len(df)

    # 1. Apply Filters
    filters_applied = {
        "department": department,
        "task_category": task_category,
        "employee_id": employee_id,
        "week": week
    }

    if department:
        df = df[df["department"].str.lower() == department.lower()]
    if task_category:
        df = df[df["task_category"].str.lower() == task_category.lower()]
    if employee_id:
        df = df[df["employee_id"].str.lower() == employee_id.lower()]
    if week:
        try:
            week_start = pd.to_datetime(week).tz_localize("Asia/Kolkata")
            week_end = week_start + pd.Timedelta(days=7)
            df = df[(df["timestamp"] >= week_start) & (df["timestamp"] < week_end)]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid week date format: {str(e)}"
            )

    filtered_records = len(df)

    # 2. Compute Headline
    total_hours = float(df["duration_hours"].sum()) if len(df) > 0 else 0.0
    hours_recoverable = float(df.loc[is_rep, "duration_hours"].sum()) if len(df) > 0 else 0.0
    inr_recoverable = float(df.loc[is_rep, "recoverable_inr"].sum()) if len(df) > 0 else 0.0
    automation_potential = (hours_recoverable / total_hours * 100) if total_hours > 0 else 0.0

    headline = {
        "total_hours": round(total_hours, 2),
        "hours_recoverable": round(hours_recoverable, 2),
        "inr_recoverable": round(inr_recoverable, 2),
        "automation_potential_percent": round(automation_potential, 2)
    }

    # 3. Aggregations: by_task_category
    by_category_list = []
    if len(df) > 0:
        cat_group = df.groupby("task_category")
        for name, group in cat_group:
            g_hours = float(group["duration_hours"].sum())
            g_rep_hours = float(group.loc[group["is_repetitive"] == True, "duration_hours"].sum())
            g_inr = float(group.loc[group["is_repetitive"] == True, "recoverable_inr"].sum())
            by_category_list.append({
                "task_category": name,
                "total_hours": round(g_hours, 2),
                "hours_recoverable": round(g_rep_hours, 2),
                "inr_recoverable": round(g_inr, 2),
                "automation_potential_percent": round((g_rep_hours / g_hours * 100), 2) if g_hours > 0 else 0.0
            })
        by_category_list = sorted(by_category_list, key=lambda x: x["total_hours"], reverse=True)

    # 4. Aggregations: by_app
    by_app_list = []
    if len(df) > 0:
        app_group = df.groupby("app_used")
        for name, group in app_group:
            g_hours = float(group["duration_hours"].sum())
            g_rep_hours = float(group.loc[group["is_repetitive"] == True, "duration_hours"].sum())
            g_inr = float(group.loc[group["is_repetitive"] == True, "recoverable_inr"].sum())
            by_app_list.append({
                "app_used": name,
                "total_hours": round(g_hours, 2),
                "hours_recoverable": round(g_rep_hours, 2),
                "inr_recoverable": round(g_inr, 2)
            })
        by_app_list = sorted(by_app_list, key=lambda x: x["total_hours"], reverse=True)

    # 5. Aggregations: by_department
    by_dept_list = []
    if len(df) > 0:
        dept_group = df.groupby("department")
        for name, group in dept_group:
            g_hours = float(group["duration_hours"].sum())
            g_rep_hours = float(group.loc[group["is_repetitive"] == True, "duration_hours"].sum())
            g_inr = float(group.loc[group["is_repetitive"] == True, "recoverable_inr"].sum())
            by_dept_list.append({
                "department": name,
                "total_hours": round(g_hours, 2),
                "hours_recoverable": round(g_rep_hours, 2),
                "inr_recoverable": round(g_inr, 2)
            })
        by_dept_list = sorted(by_dept_list, key=lambda x: x["total_hours"], reverse=True)

    # 6. Automation Ranking
    # Formula-based ranking score: (hours_recoverable * average_hourly_rate)
    # Highlight categories with highest recovery potentials.
    automation_ranking = []
    for item in by_category_list:
        if item["hours_recoverable"] > 0:
            score = item["hours_recoverable"] * (item["inr_recoverable"] / item["hours_recoverable"] if item["hours_recoverable"] > 0 else 0)
            automation_ranking.append({
                "task_category": item["task_category"],
                "score": round(score, 2),
                "hours_recoverable": item["hours_recoverable"],
                "inr_recoverable": item["inr_recoverable"],
                "reason": f"High automation potential: {item['hours_recoverable']} hours of repetitive tasks costing INR {item['inr_recoverable']}."
            })
    automation_ranking = sorted(automation_ranking, key=lambda x: x["score"], reverse=True)

    # 7. Weekly Trend
    weekly_trend = []
    if len(df) > 0:
        # Group by week starting Monday
        df["week_start"] = df["timestamp"].dt.to_period("W").dt.start_time
        week_group = df.groupby("week_start")
        for ws, group in week_group:
            g_hours = float(group["duration_hours"].sum())
            g_rep_hours = float(group.loc[group["is_repetitive"] == True, "duration_hours"].sum())
            g_inr = float(group.loc[group["is_repetitive"] == True, "recoverable_inr"].sum())
            weekly_trend.append({
                "week_start": ws.strftime("%Y-%m-%d"),
                "total_hours": round(g_hours, 2),
                "hours_recoverable": round(g_rep_hours, 2),
                "inr_recoverable": round(g_inr, 2)
            })
        weekly_trend = sorted(weekly_trend, key=lambda x: x["week_start"])

    # 8. Anomaly Reports
    anomalies = []
    if len(df) > 0:
        # Check negative durations
        neg_df = df[df["is_negative_duration"] == True]
        for _, row in neg_df.iterrows():
            anomalies.append({
                "id": int(row["id"]),
                "employee_id": row["employee_id"],
                "timestamp": row["timestamp"].isoformat(),
                "type": "negative_duration",
                "description": f"Negative duration ({row['duration_minutes']} min) logged for {row['app_used']}."
            })
            
        # Check missing durations
        missing_df = df[df["is_missing_duration"] == True]
        for _, row in missing_df.iterrows():
            anomalies.append({
                "id": int(row["id"]),
                "employee_id": row["employee_id"],
                "timestamp": row["timestamp"].isoformat(),
                "type": "missing_duration",
                "description": f"Missing activity duration logged for {row['app_used']}."
            })

        # Check statistical outliers (> threshold)
        outlier_df = df[df["is_outlier_duration"] == True]
        for _, row in outlier_df.iterrows():
            anomalies.append({
                "id": int(row["id"]),
                "employee_id": row["employee_id"],
                "timestamp": row["timestamp"].isoformat(),
                "type": "outlier_duration",
                "description": f"Activity duration outlier ({row['duration_minutes']} min) logged for {row['app_used']}."
            })

    # Meta
    min_date = df["timestamp"].min() if len(df) > 0 else None
    max_date = df["timestamp"].max() if len(df) > 0 else None
    meta = {
        "total_records": total_records,
        "filtered_records": filtered_records,
        "date_range": {
            "start": min_date.isoformat() if min_date else None,
            "end": max_date.isoformat() if max_date else None
        },
        "filters": filters_applied
    }

    return {
        "headline": headline,
        "by_task_category": by_category_list,
        "by_app": by_app_list,
        "by_department": by_dept_list,
        "automation_ranking": automation_ranking,
        "weekly_trend": weekly_trend,
        "anomalies": anomalies,
        "meta": meta
    }
