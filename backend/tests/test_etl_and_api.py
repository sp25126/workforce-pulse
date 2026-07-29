import os
import pytest
import pandas as pd
from fastapi.testclient import TestClient
from app.main import app
from app.services.etl import (
    parse_ist_datetime,
    clean_app_name,
    clean_category,
    clean_repetitive,
    normalize_employees,
    build_joined_dataset
)

client = TestClient(app)

# 1. ETL Unit Tests
def test_parse_ist_datetime():
    # Test valid parsing from mixed formats
    t1 = parse_ist_datetime("2025-10-08 13:46:09")
    t2 = parse_ist_datetime("21/10/2025 14:44")
    t3 = parse_ist_datetime("2025-10-17T13:21:23")
    
    assert pd.notna(t1)
    assert pd.notna(t2)
    assert pd.notna(t3)
    
    # Assert timezone is Asia/Kolkata (IST)
    assert t1.tzinfo.zone == "Asia/Kolkata"
    assert t2.tzinfo.zone == "Asia/Kolkata"
    assert t3.tzinfo.zone == "Asia/Kolkata"

def test_clean_app_name():
    assert clean_app_name("MS Outlook") == "Outlook"
    assert clean_app_name("outlook") == "Outlook"
    assert clean_app_name("google chrome") == "Chrome"
    assert clean_app_name("EXCEL") == "Excel"
    assert clean_app_name("sap") == "SAP"
    assert clean_app_name("-") == "Unknown"
    assert clean_app_name(None) == "Unknown"

def test_clean_category():
    assert clean_category("Cal Mgmt") == "Calendar Management"
    assert clean_category("calendar management") == "Calendar Management"
    assert clean_category("internal comms") == "Internal Communication"
    assert clean_category("status updates") == "Status Updates"
    assert clean_category("reporting") == "Reporting"
    assert clean_category("data-entry") == "Data Entry"

def test_clean_repetitive():
    assert clean_repetitive("yes") is True
    assert clean_repetitive("TRUE") is True
    assert clean_repetitive("1") is True
    assert clean_repetitive("no") is False
    assert clean_repetitive("FALSE") is False
    assert clean_repetitive(None) is False

def test_normalize_employees_duplicate_resolution():
    # Setup dummy raw employee dataframe with duplicates (E007)
    dummy_data = pd.DataFrame([
        {
            "EmployeeID": "E007",
            "Name": "Employee 007 Old",
            "Dept": "Sales",
            "Role": "Account Executive",
            "salary_LPA": 14.0,
            "tenureMonths": 40,
            "Status": "active"
        },
        {
            "employee_id": "E007",
            "name": "Employee 007",
            "department": "Sales",
            "role": "Senior Account Executive",
            "annual_ctc_inr": 2400000,
            "tenure_months": 28,
            "status": "active"
        }
    ])
    
    df_clean, report = normalize_employees(dummy_data)
    assert len(df_clean) == 1
    assert report["duplicates_resolved"] == 1
    
    # Assert preferred flat-schema values
    emp_record = df_clean.iloc[0]
    assert emp_record["employee_id"] == "E007"
    assert emp_record["name"] == "Employee 007"
    assert emp_record["role"] == "Senior Account Executive"
    assert emp_record["annual_ctc_inr"] == 2400000.0

def test_missing_metadata_and_activity():
    # activity_df with E013 (which has no employee details in employees_df)
    activity_df = pd.DataFrame([
        {
            "employee_id": "E013",
            "department": "HR",
            "timestamp": parse_ist_datetime("2025-10-17 13:21:23"),
            "app_used": "Gmail",
            "task_category": "Internal Communication",
            "duration_minutes": 1.0,
            "is_repetitive": False,
            "is_negative_duration": False,
            "is_zero_duration": False,
            "is_missing_duration": False,
            "is_outlier_duration": False
        }
    ])
    
    # E099 (which is in HRMS but has no activities in activity_df)
    employees_df = pd.DataFrame([
        {
            "employee_id": "E099",
            "name": "Employee 099",
            "department": "Operations",
            "role": "Operations Analyst",
            "salary_lpa": 7.0,
            "annual_ctc_inr": 700000.0,
            "hourly_rate_inr": None,
            "tenure_months": 8,
            "working_hours": "9-18",
            "status": "active"
        }
    ])
    
    joined, report = build_joined_dataset(activity_df, employees_df)
    
    # E013 should be kept but metadata marked missing
    assert len(joined) == 1
    assert joined.iloc[0]["name"] == "metadata_missing"
    assert joined.iloc[0]["department"] == "HR" # fallback to department from activity log
    
    # E099 should be flagged as no-activity employee
    assert "E099" in report["no_activity_employees"]

# 2. Aggregates API Integration Tests
def test_aggregates_endpoint_shape():
    response = client.get("/api/aggregates/")
    assert response.status_code == 200
    
    data = response.json()
    
    # Verify top-level keys
    keys = ["headline", "by_task_category", "by_app", "by_department", "automation_ranking", "weekly_trend", "anomalies", "meta"]
    for k in keys:
        assert k in data
        
    # Verify headline subkeys
    headline_keys = ["total_hours", "hours_recoverable", "inr_recoverable", "automation_potential_percent"]
    for hk in headline_keys:
        assert hk in data["headline"]

def test_aggregates_endpoint_filtered():
    # Filter by department
    response = client.get("/api/aggregates/?department=Operations")
    assert response.status_code == 200
    data = response.json()
    
    # Verify meta filters are recorded
    assert data["meta"]["filters"]["department"] == "Operations"
    
    # If there is data in the response, verify all entries belong to Operations department
    if len(data["by_department"]) > 0:
        for dept_item in data["by_department"]:
            assert dept_item["department"].lower() == "operations"
