import os
import json
import pandas as pd
import numpy as np
import pytz
from typing import Tuple, Dict, Any

def parse_ist_datetime(val) -> pd.Timestamp:
    """
    Parses a datetime string from mixed formats into an IST-aware pandas Timestamp.
    IST is GMT+5:30.
    """
    if pd.isna(val) or str(val).strip() in ["", "-"]:
        return pd.NaT
    
    val_str = str(val).strip()
    # Try common formats
    for fmt in [
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M",
        "%d/%m/%Y %H:%M:%S",
    ]:
        try:
            dt = pd.to_datetime(val_str, format=fmt)
            if dt.tzinfo is None:
                dt = pytz.timezone("Asia/Kolkata").localize(dt)
            else:
                dt = dt.astimezone(pytz.timezone("Asia/Kolkata"))
            return dt
        except (ValueError, TypeError):
            continue
            
    # Fallback to general pandas parser
    try:
        dt = pd.to_datetime(val_str)
        if dt.tzinfo is None:
            dt = pytz.timezone("Asia/Kolkata").localize(dt)
        else:
            dt = dt.astimezone(pytz.timezone("Asia/Kolkata"))
        return dt
    except Exception:
        return pd.NaT

def clean_app_name(val) -> str:
    """
    Standardizes app names to canonical forms.
    """
    if pd.isna(val):
        return "Unknown"
    val_str = str(val).strip().lower()
    if any(x in val_str for x in ["outlook"]):
        return "Outlook"
    if any(x in val_str for x in ["gmail"]):
        return "Gmail"
    if any(x in val_str for x in ["slack"]):
        return "Slack"
    if any(x in val_str for x in ["excel"]):
        return "Excel"
    if any(x in val_str for x in ["zoho"]):
        return "Zoho CRM"
    if any(x in val_str for x in ["chrome"]):
        return "Chrome"
    if any(x in val_str for x in ["sap"]):
        return "SAP"
    if any(x in val_str for x in ["powerpoint", "ppt"]):
        return "PowerPoint"
    if any(x in val_str for x in ["zoom"]):
        return "Zoom"
    if any(x in val_str for x in ["salesforce", "sfdc", "sales force"]):
        return "Salesforce"
    if any(x in val_str for x in ["word"]):
        return "Word"
    if any(x in val_str for x in ["notion"]):
        return "Notion"
    if any(x in val_str for x in ["jira"]):
        return "Jira"
    if any(x in val_str for x in ["tally"]):
        return "Tally"
    if any(x in val_str for x in ["whatsapp"]):
        return "WhatsApp"
    if val_str == "-" or val_str == "":
        return "Unknown"
    return str(val).strip()

def clean_category(val) -> str:
    """
    Standardizes task categories to canonical forms.
    """
    if pd.isna(val):
        return "Unknown"
    val_str = str(val).strip().lower()
    if any(x in val_str for x in ["cal mgmt", "calendar"]):
        return "Calendar Management"
    if any(x in val_str for x in ["internal comm", "internal meeting"]):
        return "Internal Communication"
    if any(x in val_str for x in ["status update"]):
        return "Status Updates"
    if any(x in val_str for x in ["email triage"]):
        return "Email Triage"
    if any(x in val_str for x in ["reporting"]):
        return "Reporting"
    if any(x in val_str for x in ["data entry", "data-entry", "lead-entry", "lead entry"]):
        return "Data Entry"
    if any(x in val_str for x in ["vendor portal"]):
        return "Vendor Portals"
    if any(x in val_str for x in ["client comm", "client call"]):
        return "Client Communication"
    if any(x in val_str for x in ["vendor mgmt", "vendor management"]):
        return "Vendor Management"
    if any(x in val_str for x in ["meeting"]):
        return "Meetings"
    if any(x in val_str for x in ["invoice proc", "invoice processing"]):
        return "Invoice Processing"
    if any(x in val_str for x in ["research"]):
        return "Research"
    if any(x in val_str for x in ["pipeline review"]):
        return "Pipeline Review"
    if any(x in val_str for x in ["crm update"]):
        return "CRM Updates"
    if any(x in val_str for x in ["deck building", "slide building"]):
        return "Deck Building"
    if any(x in val_str for x in ["drafting", "documentation", "docs"]):
        return "Documentation"
    if any(x in val_str for x in ["reconciliation", "recon"]):
        return "Reconciliation"
    if any(x in val_str for x in ["notes"]):
        return "Notes"
    if any(x in val_str for x in ["ticket update"]):
        return "Ticket Updates"
    if any(x in val_str for x in ["bookkeeping"]):
        return "Bookkeeping"
    if any(x in val_str for x in ["gst"]):
        return "GST Prep"
    if val_str == "-" or val_str == "":
        return "Unknown"
    return str(val).strip()

def clean_repetitive(val) -> bool:
    """
    Normalizes repetitive flag.
    """
    if pd.isna(val):
        return False
    val_str = str(val).strip().lower()
    if val_str in ["yes", "true", "1", "t", "y"]:
        return True
    return False

def load_raw_files(activity_path: str, employees_path: str) -> Tuple[pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Loads raw activity CSV and employees JSON files.
    """
    # Load activity
    activity_df = pd.read_csv(activity_path)
    
    # Load employees
    with open(employees_path, "r", encoding="utf-8") as f:
        emp_data = json.load(f)
    
    employees_df = pd.DataFrame(emp_data.get("employees", []))
    
    report = {
        "activity_raw_rows": len(activity_df),
        "employees_raw_rows": len(employees_df),
    }
    
    return activity_df, employees_df, report

def normalize_activity(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and normalizes the activity dataframe.
    """
    original_len = len(df)
    
    # Deduplicate exact duplicate rows
    df_cleaned = df.drop_duplicates().copy()
    deduped_rows = original_len - len(df_cleaned)
    
    # Normalize formats
    df_cleaned["timestamp"] = df_cleaned["timestamp"].apply(parse_ist_datetime)
    df_cleaned["app_used"] = df_cleaned["app_used"].apply(clean_app_name)
    df_cleaned["task_category"] = df_cleaned["task_category"].apply(clean_category)
    df_cleaned["is_repetitive"] = df_cleaned["is_repetitive"].apply(clean_repetitive)
    
    # Convert duration_minutes to numeric, handling missing/invalid
    df_cleaned["duration_minutes"] = pd.to_numeric(df_cleaned["duration_minutes"], errors="coerce")
    
    # Flag anomalies
    df_cleaned["is_negative_duration"] = df_cleaned["duration_minutes"] < 0
    df_cleaned["is_zero_duration"] = df_cleaned["duration_minutes"] == 0
    df_cleaned["is_missing_duration"] = df_cleaned["duration_minutes"].isna()
    
    # IQR outlier detection on valid durations
    valid_durations = df_cleaned.loc[df_cleaned["duration_minutes"] > 0, "duration_minutes"]
    if len(valid_durations) > 0:
        q1 = valid_durations.quantile(0.25)
        q3 = valid_durations.quantile(0.75)
        iqr = q3 - q1
        outlier_threshold = q3 + 1.5 * iqr
        # fallback to 120 if threshold is too small or large
        if outlier_threshold <= 0 or pd.isna(outlier_threshold):
            outlier_threshold = 120.0
    else:
        outlier_threshold = 120.0
        
    df_cleaned["is_outlier_duration"] = df_cleaned["duration_minutes"] > outlier_threshold
    
    report = {
        "cleaned_rows": len(df_cleaned),
        "deduplicated_rows_count": deduped_rows,
        "negative_duration_count": int(df_cleaned["is_negative_duration"].sum()),
        "zero_duration_count": int(df_cleaned["is_zero_duration"].sum()),
        "missing_duration_count": int(df_cleaned["is_missing_duration"].sum()),
        "outlier_duration_count": int(df_cleaned["is_outlier_duration"].sum()),
        "outlier_threshold_minutes": outlier_threshold
    }
    
    return df_cleaned, report

def normalize_employees(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans and normalizes the employees dataframe.
    """
    # We resolve duplicates sequentially.
    # Since the JSON is parsed into a list, we iterate over records to build a dict
    # mapped by lowercase employee_id, ensuring newer ones overwrite older.
    normalized_list = []
    seen = {}
    
    for idx, row in df.iterrows():
        # Handle mixed casings of EmployeeID
        emp_id = row.get("employee_id") or row.get("EmployeeID")
        if not emp_id or pd.isna(emp_id):
            continue
        emp_id = str(emp_id).strip()
        
        # Check schema type: newer flat-schema has "annual_ctc_inr" or lowercase "employee_id"
        is_flat_schema = "annual_ctc_inr" in row and pd.notna(row["annual_ctc_inr"])
        
        # Format working hours
        wh = row.get("working_hours") or row.get("workingHours")
        if isinstance(wh, dict):
            wh_str = f"{wh.get('start', '09:00')}-{wh.get('end', '18:00')}"
        elif pd.notna(wh):
            wh_str = str(wh).strip()
        else:
            wh_str = "09:00-18:00" # fallback default
            
        # Get salaries
        sal_lpa = row.get("salary_LPA") or row.get("salary_lpa")
        sal_lpa = float(sal_lpa) if pd.notna(sal_lpa) else None
        
        annual_ctc = row.get("annual_ctc_inr")
        if pd.notna(annual_ctc):
            annual_ctc = float(annual_ctc)
        elif sal_lpa is not None:
            annual_ctc = sal_lpa * 100000.0
        else:
            annual_ctc = None
            
        hourly_rate = row.get("hourly_rate_inr")
        hourly_rate = float(hourly_rate) if pd.notna(hourly_rate) else None
        
        # Estimate CTC if only hourly rate is present
        if annual_ctc is None and hourly_rate is not None:
            annual_ctc = hourly_rate * 8 * 260 # 8 hours, 5 days, 52 weeks = 2080 hours
            sal_lpa = annual_ctc / 100000.0

        emp_record = {
            "employee_id": emp_id,
            "name": row.get("name") or row.get("Name"),
            "department": row.get("department") or row.get("Dept"),
            "role": row.get("role") or row.get("Role"),
            "salary_lpa": sal_lpa,
            "annual_ctc_inr": annual_ctc,
            "hourly_rate_inr": hourly_rate,
            "tenure_months": int(row.get("tenure_months") or row.get("tenureMonths")) if pd.notna(row.get("tenure_months") or row.get("tenureMonths")) else 0,
            "working_hours": wh_str,
            "status": str(row.get("status") or row.get("Status") or "active").strip().lower()
        }
        
        # Resolve E007 by preferring newer flat-schema record (or later item)
        if emp_id in seen:
            prev_idx = seen[emp_id]
            # Replace older one
            normalized_list[prev_idx] = emp_record
        else:
            seen[emp_id] = len(normalized_list)
            normalized_list.append(emp_record)
            
    df_clean = pd.DataFrame(normalized_list)
    
    report = {
        "total_employees_clean": len(df_clean),
        "duplicates_resolved": len(df) - len(df_clean)
    }
    
    return df_clean, report

def build_joined_dataset(activity_df: pd.DataFrame, employees_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Joins the cleaned activity and employees datasets.
    """
    # Join on employee_id
    joined_df = activity_df.merge(
        employees_df,
        on="employee_id",
        how="left",
        suffixes=("", "_emp")
    )
    
    # Identify rows where employee metadata is missing (like E013)
    # i.e. employee_id matches activity, but name/dept from employee table is NaN
    missing_metadata_mask = joined_df["name"].isna() & joined_df["employee_id"].notna()
    joined_df.loc[missing_metadata_mask, "name"] = "metadata_missing"
    joined_df.loc[missing_metadata_mask, "department"] = joined_df.loc[missing_metadata_mask, "department"].fillna("metadata_missing")
    
    # E099 represents an employee in HRMS but with no activity logs.
    # To identify such employees, we check who is in employees_df but not in activity_df.
    no_activity_employees = employees_df[~employees_df["employee_id"].isin(activity_df["employee_id"])]["employee_id"].tolist()
    
    report = {
        "joined_rows": len(joined_df),
        "missing_metadata_rows_count": int(missing_metadata_mask.sum()),
        "no_activity_employees": no_activity_employees
    }
    
    return joined_df, report

if __name__ == "__main__":
    import sys
    # Paths for raw data
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    act_path = os.path.join(base_dir, "data", "raw", "activity_logs.csv")
    emp_path = os.path.join(base_dir, "data", "raw", "employees.json")
    
    if not os.path.exists(act_path) or not os.path.exists(emp_path):
        print(json.dumps({"error": f"Raw files not found. Checked: {act_path} and {emp_path}"}, indent=2))
        sys.exit(1)
        
    try:
        raw_act, raw_emp, load_rep = load_raw_files(act_path, emp_path)
        clean_act, act_rep = normalize_activity(raw_act)
        clean_emp, emp_rep = normalize_employees(raw_emp)
        joined, join_rep = build_joined_dataset(clean_act, clean_emp)
        
        final_report = {
            "load_report": load_rep,
            "activity_report": act_rep,
            "employee_report": emp_rep,
            "join_report": join_rep
        }
        print(json.dumps(final_report, indent=2))
    except Exception as e:
        print(json.dumps({"error": str(e)}, indent=2))
        sys.exit(1)
