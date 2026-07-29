import os
import sys
import json
import pandas as pd
from pathlib import Path

# Resolve root directory and backend directory paths to ensure imports resolve
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.services.etl import (
    load_raw_files,
    normalize_activity,
    normalize_employees,
    build_joined_dataset
)

def seed_database():
    schema_path = os.path.join(backend_dir, "app", "models", "schema.sql")
    act_path = os.path.join(backend_dir, "data", "raw", "activity_logs.csv")
    emp_path = os.path.join(backend_dir, "data", "raw", "employees.json")
    
    print("Connecting to database...")
    engine = create_engine(settings.DATABASE_URL)
    
    # 1. Initialize Schema
    print("Initializing database schema...")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()
        
    with engine.begin() as conn:
        statements = schema_sql.split(";")
        for stmt in statements:
            stmt_clean = stmt.strip()
            if stmt_clean:
                conn.execute(text(stmt_clean))
    print("Schema initialized successfully.")
    
    # 2. Run ETL pipeline
    print("Running ETL pipeline...")
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
    
    # 3. Seed tables using pandas to_sql
    print("Seeding tables...")
    with engine.begin() as conn:
        # Load employees
        clean_emp.to_sql("employees_clean", con=conn, if_exists="append", index=False)
        print(f"Seeded employees_clean: {len(clean_emp)} rows.")
        
        # Load activity_clean
        act_columns = [
            "employee_id", "department", "timestamp", "app_used", "task_category", 
            "duration_minutes", "is_repetitive", "is_negative_duration", 
            "is_zero_duration", "is_missing_duration", "is_outlier_duration"
        ]
        clean_act_subset = clean_act[act_columns].copy()
        clean_act_subset.to_sql("activity_clean", con=conn, if_exists="append", index=False)
        print(f"Seeded activity_clean: {len(clean_act_subset)} rows.")
        
        # Load joined_activity
        joined_columns = act_columns + [
            "name", "role", "salary_lpa", "annual_ctc_inr", 
            "hourly_rate_inr", "tenure_months", "working_hours", "status"
        ]
        joined_subset = joined[joined_columns].copy()
        joined_subset.to_sql("joined_activity", con=conn, if_exists="append", index=False)
        print(f"Seeded joined_activity: {len(joined_subset)} rows.")
        
        # 4. Insert pipeline runs report
        log_query = text("""
            INSERT INTO pipeline_runs (status, report)
            VALUES (:status, :report)
        """)
        conn.execute(log_query, {
            "status": "SUCCESS",
            "report": json.dumps(final_report)
        })
        print("Logged pipeline run.")
 
    print("\nDatabase seeding completed successfully.")
    print("--- Summary ---")
    print(f"Employees loaded: {len(clean_emp)}")
    print(f"Activities loaded: {len(clean_act)}")
    print(f"Joined records loaded: {len(joined)}")

if __name__ == "__main__":
    seed_database()
