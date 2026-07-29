from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List, Dict, Any
from app.core.config import settings

router = APIRouter()

def get_db_engine():
    from sqlalchemy import create_engine
    return create_engine(settings.db_url)

@router.get("/")
def get_aggregates(
    department: Optional[str] = Query(None, description="Filter by department"),
    task_category: Optional[str] = Query(None, description="Filter by task category"),
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    week: Optional[str] = Query(None, description="Filter by week start date (YYYY-MM-DD)")
):
    import pandas as pd
    import numpy as np

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

    # Data sanitization & column mapping (is_repetitive in DB mapped to repetitive)
    df["duration_minutes"] = pd.to_numeric(df["duration_minutes"], errors="coerce").fillna(0.0)
    
    rep_col = "is_repetitive" if "is_repetitive" in df.columns else ("repetitive" if "repetitive" in df.columns else None)
    if rep_col:
        df["repetitive"] = df[rep_col].fillna(False).astype(bool)
    else:
        df["repetitive"] = False
        
    df["hourly_rate_inr"] = pd.to_numeric(df["hourly_rate_inr"], errors="coerce").fillna(0.0)
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    # Flag Anomalies (Negative durations or extreme outliers > 12 hours)
    anomalies = []
    anomaly_rows = df[(df["duration_minutes"] < 0) | (df["duration_minutes"] > 720)]
    for _, row in anomaly_rows.iterrows():
        a_type = "negative_duration" if row["duration_minutes"] < 0 else "outlier_duration"
        desc = f"Negative duration of {row['duration_minutes']} min detected" if a_type == "negative_duration" else f"Unusually high duration of {row['duration_minutes']} min detected"
        anomalies.append({
            "activity_id": int(row["id"]),
            "employee_id": str(row["employee_id"]),
            "type": a_type,
            "description": desc,
            "timestamp": row["timestamp"].isoformat() if pd.notnull(row["timestamp"]) else None
        })

    # Clean working dataset (exclude negative durations for metric aggregates)
    clean_df = df[df["duration_minutes"] >= 0].copy()

    # Filter Application
    filtered_df = clean_df.copy()
    active_filters = {}
    if department:
        filtered_df = filtered_df[filtered_df["department"].str.lower() == department.lower()]
        active_filters["department"] = department
    if task_category:
        filtered_df = filtered_df[filtered_df["task_category"].str.lower() == task_category.lower()]
        active_filters["task_category"] = task_category
    if employee_id:
        filtered_df = filtered_df[filtered_df["employee_id"].str.lower() == employee_id.lower()]
        active_filters["employee_id"] = employee_id
    if week:
        # Week filter expects start of week date YYYY-MM-DD
        filtered_df["week_start"] = filtered_df["timestamp"].dt.to_period("W").dt.start_time.dt.strftime("%Y-%m-%d")
        filtered_df = filtered_df[filtered_df["week_start"] == week]
        active_filters["week"] = week

    # Calculate Headline Metrics
    total_hours = round(float(filtered_df["duration_minutes"].sum() / 60.0), 1)
    
    # Repetitive hours & recoverable calculation (60% yield rule)
    repetitive_df = filtered_df[filtered_df["repetitive"] == True]
    repetitive_hours = float(repetitive_df["duration_minutes"].sum() / 60.0)
    hours_recoverable = round(repetitive_hours * 0.6, 1)

    # Recoverable INR cost (hours_recoverable * hourly rate for each task)
    repetitive_df = repetitive_df.copy()
    repetitive_df["recoverable_inr"] = (repetitive_df["duration_minutes"] / 60.0) * 0.6 * repetitive_df["hourly_rate_inr"]
    inr_recoverable = round(float(repetitive_df["recoverable_inr"].sum()), 2)

    automation_potential_percent = round((repetitive_hours / total_hours * 100), 1) if total_hours > 0 else 0.0

    headline = {
        "total_hours": total_hours,
        "hours_recoverable": hours_recoverable,
        "inr_recoverable": inr_recoverable,
        "automation_potential_percent": automation_potential_percent
    }

    # Grouping by Task Category
    task_cat_grouped = filtered_df.groupby("task_category", as_index=False).agg(
        total_minutes=("duration_minutes", "sum")
    )
    rep_task_cat = repetitive_df.groupby("task_category", as_index=False).agg(
        rep_minutes=("duration_minutes", "sum"),
        recoverable_inr=("recoverable_inr", "sum")
    )
    task_cat_merged = pd.merge(task_cat_grouped, rep_task_cat, on="task_category", how="left").fillna(0.0)
    
    by_task_category = []
    for _, row in task_cat_merged.sort_values(by="total_minutes", ascending=False).iterrows():
        cat_total_hrs = round(row["total_minutes"] / 60.0, 1)
        cat_rec_hrs = round((row["rep_minutes"] / 60.0) * 0.6, 1)
        by_task_category.append({
            "task_category": row["task_category"],
            "total_hours": cat_total_hrs,
            "hours_recoverable": cat_rec_hrs,
            "inr_recoverable": round(row["recoverable_inr"], 2)
        })

    # Grouping by App
    app_grouped = filtered_df.groupby("app_used", as_index=False).agg(
        total_minutes=("duration_minutes", "sum")
    )
    rep_app = repetitive_df.groupby("app_used", as_index=False).agg(
        rep_minutes=("duration_minutes", "sum")
    )
    app_merged = pd.merge(app_grouped, rep_app, on="app_used", how="left").fillna(0.0)

    by_app = []
    for _, row in app_merged.sort_values(by="total_minutes", ascending=False).iterrows():
        by_app.append({
            "app_used": row["app_used"],
            "total_hours": round(row["total_minutes"] / 60.0, 1),
            "hours_recoverable": round((row["rep_minutes"] / 60.0) * 0.6, 1)
        })

    # Grouping by Department
    dept_grouped = filtered_df.groupby("department", as_index=False).agg(
        total_minutes=("duration_minutes", "sum")
    )
    rep_dept = repetitive_df.groupby("department", as_index=False).agg(
        rep_minutes=("duration_minutes", "sum")
    )
    dept_merged = pd.merge(dept_grouped, rep_dept, on="department", how="left").fillna(0.0)

    by_department = []
    for _, row in dept_merged.sort_values(by="total_minutes", ascending=False).iterrows():
        by_department.append({
            "department": row["department"],
            "total_hours": round(row["total_minutes"] / 60.0, 1),
            "hours_recoverable": round((row["rep_minutes"] / 60.0) * 0.6, 1)
        })

    # Automation Ranking (Top candidates by INR recoverable)
    automation_ranking = []
    ranked_tasks = sorted(by_task_category, key=lambda x: x["inr_recoverable"], reverse=True)
    for t in ranked_tasks:
        if t["hours_recoverable"] > 0:
            reason_str = f"High repetitive volume ({t['hours_recoverable']} hrs recoverable). Automation potential: {round(t['hours_recoverable']/t['total_hours']*100, 1) if t['total_hours']>0 else 0}%."
            automation_ranking.append({
                "task_category": t["task_category"],
                "hours_recoverable": t["hours_recoverable"],
                "inr_recoverable": t["inr_recoverable"],
                "reason": reason_str
            })

    # Weekly Trend Analysis
    clean_df["week_start"] = clean_df["timestamp"].dt.to_period("W").dt.start_time.dt.strftime("%Y-%m-%d")
    weekly_total = clean_df.groupby("week_start", as_index=False).agg(total_minutes=("duration_minutes", "sum"))
    
    rep_clean = clean_df[clean_df["repetitive"] == True].copy()
    rep_clean["recoverable_inr"] = (rep_clean["duration_minutes"] / 60.0) * 0.6 * rep_clean["hourly_rate_inr"]
    weekly_rep = rep_clean.groupby("week_start", as_index=False).agg(
        rep_minutes=("duration_minutes", "sum"),
        inr_recoverable=("recoverable_inr", "sum")
    )
    
    weekly_merged = pd.merge(weekly_total, weekly_rep, on="week_start", how="left").fillna(0.0)
    weekly_trend = []
    for _, row in weekly_merged.sort_values(by="week_start").iterrows():
        weekly_trend.append({
            "week_start": row["week_start"],
            "total_hours": round(row["total_minutes"] / 60.0, 1),
            "hours_recoverable": round((row["rep_minutes"] / 60.0) * 0.6, 1),
            "inr_recoverable": round(row["inr_recoverable"], 2)
        })

    # Metadata options for UI filters
    all_depts = sorted(clean_df["department"].dropna().unique().tolist())
    all_categories = sorted(clean_df["task_category"].dropna().unique().tolist())
    all_employees = sorted(clean_df["employee_id"].dropna().unique().tolist())
    all_weeks = sorted(clean_df["week_start"].dropna().unique().tolist())

    date_min = clean_df["timestamp"].min().strftime("%Y-%m-%d") if not clean_df.empty and pd.notnull(clean_df["timestamp"].min()) else None
    date_max = clean_df["timestamp"].max().strftime("%Y-%m-%d") if not clean_df.empty and pd.notnull(clean_df["timestamp"].max()) else None

    return {
        "headline": headline,
        "by_task_category": by_task_category,
        "by_app": by_app,
        "by_department": by_department,
        "automation_ranking": automation_ranking,
        "weekly_trend": weekly_trend,
        "anomalies": anomalies,
        "meta": {
            "total_records": len(df),
            "filtered_records": len(filtered_df),
            "date_range": f"{date_min} to {date_max}" if date_min and date_max else None,
            "filters": active_filters,
            "options": {
                "departments": all_depts,
                "categories": all_categories,
                "employees": all_employees,
                "weeks": all_weeks
            }
        }
    }
