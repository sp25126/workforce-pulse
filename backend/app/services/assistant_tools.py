import pandas as pd
from typing import Dict, Any, Optional
from sqlalchemy import text
from app.api.routes.aggregates import get_aggregates, get_db_engine

def query_aggregates(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches the aggregates response dictionary for a given set of filters.
    """
    dept = filters.get("department")
    cat = filters.get("task_category")
    emp = filters.get("employee_id")
    wk = filters.get("week")
    
    try:
        res = get_aggregates(department=dept, task_category=cat, employee_id=emp, week=wk)
        return {
            "headline": res.get("headline"),
            "meta": res.get("meta"),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_employee_detail(employee_id: str) -> Dict[str, Any]:
    """
    Fetches personal workload statistics, role, department, and compensation for a specific employee.
    """
    try:
        # Fetch aggregates for employee, explicitly setting unused filters to None to bypass FastAPI Query defaults
        res = get_aggregates(department=None, task_category=None, employee_id=employee_id, week=None)
        
        # Load raw DB record to look up CTC using SQLAlchemy 2.0 executable text query
        engine = get_db_engine()
        comp_info = {}
        
        with engine.connect() as conn:
            query = text("SELECT department, annual_ctc_inr, hourly_rate_inr FROM joined_activity WHERE employee_id = :emp_id LIMIT 1")
            result = conn.execute(query, {"emp_id": employee_id}).fetchone()
            
            if result:
                dept, annual_ctc, hourly_rate = result
                comp_info = {
                    "department": dept,
                    "annual_ctc": float(annual_ctc) if annual_ctc is not None else None,
                    "hourly_rate": float(hourly_rate) if hourly_rate is not None else None
                }
                
                # Format canonical rate details
                if comp_info["annual_ctc"]:
                    comp_info["monthly_salary_estimate"] = round(comp_info["annual_ctc"] / 12.0, 2)
                if not comp_info["hourly_rate"] and comp_info["annual_ctc"]:
                    comp_info["hourly_rate"] = round(comp_info["annual_ctc"] / 2080.0, 2)
                    
        return {
            "employee_id": employee_id,
            "headline": res.get("headline"),
            "top_tasks": res.get("by_task_category")[:3],
            "anomalies_count": len(res.get("anomalies", [])),
            "compensation": comp_info,
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_department_detail(department: str) -> Dict[str, Any]:
    """
    Fetches aggregate KPIs and task breakdown matching a department name.
    """
    try:
        # Explicitly setting unused filters to None to bypass FastAPI Query defaults
        res = get_aggregates(department=department, task_category=None, employee_id=None, week=None)
        return {
            "department": department,
            "headline": res.get("headline"),
            "top_tasks": res.get("by_task_category")[:5],
            "top_apps": res.get("by_app")[:5],
            "automation_ranking": res.get("automation_ranking")[:3],
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_task_detail(task_category: str) -> Dict[str, Any]:
    """
    Fetches performance metrics, hours recoverable, and department distribution for a task category.
    """
    try:
        # Explicitly setting unused filters to None to bypass FastAPI Query defaults
        res = get_aggregates(department=None, task_category=task_category, employee_id=None, week=None)
        return {
            "task_category": task_category,
            "headline": res.get("headline"),
            "by_department_distribution": res.get("by_department"),
            "automation_ranking": [r for r in res.get("automation_ranking", []) if r.get("task_category") == task_category],
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_weekly_trend(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches the weekly trend points matching current filter context.
    """
    try:
        res = get_aggregates(
            department=filters.get("department"),
            task_category=filters.get("task_category"),
            employee_id=filters.get("employee_id"),
            week=filters.get("week")
        )
        return {
            "weekly_trend": res.get("weekly_trend"),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_anomaly_context(filters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fetches list of data quality audit flags matching active filters.
    """
    try:
        res = get_aggregates(
            department=filters.get("department"),
            task_category=filters.get("task_category"),
            employee_id=filters.get("employee_id"),
            week=filters.get("week")
        )
        return {
            "anomalies": res.get("anomalies"),
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
