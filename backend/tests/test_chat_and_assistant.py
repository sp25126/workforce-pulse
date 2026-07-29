import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.routes.chat import extract_filters
from app.services.assistant_tools import (
    query_aggregates,
    get_employee_detail,
    get_department_detail,
    get_task_detail
)

client = TestClient(app)

def test_extract_filters():
    # Test employee extraction
    f1 = extract_filters("Who is employee E002 in Finance?")
    assert f1.get("employee_id") == "E002"
    assert f1.get("department") == "Finance"
    
    # Test department extraction
    f2 = extract_filters("Show me email triage time in Sales department")
    assert f2.get("department") == "Sales"
    assert f2.get("task_category") == "Email Triage"
    
    # Test reset text
    f3 = extract_filters("What's the status for operations?")
    assert f3.get("department") == "Operations"

def test_assistant_tools_query():
    # Test query aggregates tool
    res = query_aggregates({"department": "Operations"})
    assert res.get("status") == "success"
    assert "headline" in res
    
    # Test get employee details
    emp_res = get_employee_detail("E002")
    assert emp_res.get("status") == "success"
    assert emp_res.get("employee_id") == "E002"
    assert "compensation" in emp_res
    
    # Test get department details
    dept_res = get_department_detail("Operations")
    assert dept_res.get("status") == "success"
    assert dept_res.get("department") == "Operations"
    assert "top_tasks" in dept_res

def test_chat_route_validation():
    # Test post to chat route with missing parameters
    res = client.post("/api/chat/", json={})
    assert res.status_code == 422 # Unprocessable Entity validation error
    
    # Test post to chat with correct structure but missing api key handling
    # The endpoint should return the assistant API key missing warning warning safely
    payload = {
        "session_id": "test_session_123",
        "messages": [
            {"role": "user", "content": "How many hours did E002 log?"}
        ]
    }
    chat_res = client.post("/api/chat/", json=payload)
    assert chat_res.status_code == 200
    assert "role" in chat_res.json()
    assert "content" in chat_res.json()
