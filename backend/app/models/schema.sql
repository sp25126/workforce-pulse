-- Supabase Schema for Workforce Pulse

-- Drop existing tables if they exist to support clean resets
DROP TABLE IF EXISTS joined_activity CASCADE;
DROP TABLE IF EXISTS activity_clean CASCADE;
DROP TABLE IF EXISTS employees_clean CASCADE;
DROP TABLE IF EXISTS pipeline_runs CASCADE;

-- 1. Employees Clean Table
CREATE TABLE employees_clean (
    employee_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(100),
    role VARCHAR(100),
    salary_lpa NUMERIC,
    annual_ctc_inr NUMERIC,
    hourly_rate_inr NUMERIC,
    tenure_months INTEGER,
    working_hours VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for employees_clean
CREATE INDEX idx_emp_dept ON employees_clean(department);
CREATE INDEX idx_emp_status ON employees_clean(status);

-- 2. Activity Clean Table
CREATE TABLE activity_clean (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE,
    app_used VARCHAR(100),
    task_category VARCHAR(100),
    duration_minutes NUMERIC,
    is_repetitive BOOLEAN DEFAULT FALSE,
    is_negative_duration BOOLEAN DEFAULT FALSE,
    is_zero_duration BOOLEAN DEFAULT FALSE,
    is_missing_duration BOOLEAN DEFAULT FALSE,
    is_outlier_duration BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for activity_clean
CREATE INDEX idx_act_emp_id ON activity_clean(employee_id);
CREATE INDEX idx_act_dept ON activity_clean(department);
CREATE INDEX idx_act_category ON activity_clean(task_category);
CREATE INDEX idx_act_timestamp ON activity_clean(timestamp);

-- 3. Joined Activity Table (Denormalized reporting table for dashboard and analytics queries)
CREATE TABLE joined_activity (
    id SERIAL PRIMARY KEY,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE,
    app_used VARCHAR(100),
    task_category VARCHAR(100),
    duration_minutes NUMERIC,
    is_repetitive BOOLEAN DEFAULT FALSE,
    is_negative_duration BOOLEAN DEFAULT FALSE,
    is_zero_duration BOOLEAN DEFAULT FALSE,
    is_missing_duration BOOLEAN DEFAULT FALSE,
    is_outlier_duration BOOLEAN DEFAULT FALSE,
    name VARCHAR(100),
    role VARCHAR(100),
    salary_lpa NUMERIC,
    annual_ctc_inr NUMERIC,
    hourly_rate_inr NUMERIC,
    tenure_months INTEGER,
    working_hours VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Indexes for joined_activity to optimize dashboard filters
CREATE INDEX idx_joined_emp_id ON joined_activity(employee_id);
CREATE INDEX idx_joined_dept ON joined_activity(department);
CREATE INDEX idx_joined_category ON joined_activity(task_category);
CREATE INDEX idx_joined_timestamp ON joined_activity(timestamp);
CREATE INDEX idx_joined_repetitive ON joined_activity(is_repetitive);

-- 4. Pipeline Runs Table (Execution logs for logging raw audits)
CREATE TABLE pipeline_runs (
    id SERIAL PRIMARY KEY,
    run_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status VARCHAR(50) NOT NULL,
    report JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
