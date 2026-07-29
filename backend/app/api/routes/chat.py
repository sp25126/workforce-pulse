from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import json
import re
from app.core.config import settings
from app.services.ai_settings import resolve_ai_provider_config
from app.services.assistant_tools import (
    query_aggregates,
    get_employee_detail,
    get_department_detail,
    get_task_detail,
    get_weekly_trend,
    get_anomaly_context
)

router = APIRouter()

# Server-side simple session memory store
CHAT_SESSIONS: Dict[str, Dict[str, Any]] = {}

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    session_id: str
    messages: List[ChatMessage]

def extract_filters(text: str) -> Dict[str, Any]:
    """
    Parses user input query to extract filter keywords (department, employee, category).
    """
    filters = {}
    text_lower = text.lower()
    
    # 1. Employee ID matching E001-E015 or E099
    emp_match = re.search(r'\b(e0\d{2}|e099|e1\d)\b', text_lower)
    if emp_match:
        filters["employee_id"] = emp_match.group(1).upper()
        
    # 2. Department matching
    departments = ["Operations", "Sales", "HR", "Marketing", "Finance", "Customer Support"]
    for d in departments:
        if d.lower() in text_lower:
            filters["department"] = d
            break
            
    # 3. Task Category mapping
    categories_map = {
        "email": "Email Triage",
        "crm": "CRM Update",
        "meeting": "Internal Meetings",
        "timesheet": "Timesheet Entry",
        "report": "Weekly Reports",
        "unknown": "Unknown"
    }
    for key, cat in categories_map.items():
        if key in text_lower:
            filters["task_category"] = cat
            break
            
    return filters

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    session_id = request.session_id
    messages = request.messages
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message history cannot be empty."
        )
        
    latest_msg = messages[-1].content
    
    # Initialize or fetch session filters memory
    session = CHAT_SESSIONS.setdefault(session_id, {"filters": {}})
    
    # Clear memory if explicitly requested
    if "reset" in latest_msg.lower() or "clear filters" in latest_msg.lower():
        session["filters"] = {}
        
    # Extract new filters and merge
    new_filters = extract_filters(latest_msg)
    session["filters"].update(new_filters)
    
    # Extract context using helper services matching active filters
    active_filters = session["filters"]
    
    # Fetch data slice using tool wrappers
    agg_res = query_aggregates(active_filters)
    
    emp_detail = None
    if active_filters.get("employee_id"):
        emp_detail = get_employee_detail(active_filters["employee_id"])
        
    dept_detail = None
    if active_filters.get("department"):
        dept_detail = get_department_detail(active_filters["department"])
        
    task_detail = None
    if active_filters.get("task_category"):
        task_detail = get_task_detail(active_filters["task_category"])
        
    trend_res = get_weekly_trend(active_filters)
    anomaly_res = get_anomaly_context(active_filters)
    
    # Construct structured Context Database
    database_context = {
        "active_filters": active_filters,
        "aggregates_headline": agg_res.get("headline") if agg_res.get("status") == "success" else None,
        "employee_details": emp_detail if emp_detail and emp_detail.get("status") == "success" else None,
        "department_details": dept_detail if dept_detail and dept_detail.get("status") == "success" else None,
        "task_details": task_detail if task_detail and task_detail.get("status") == "success" else None,
        "weekly_trend": trend_res.get("weekly_trend") if trend_res.get("status") == "success" else None,
        "anomalies": anomaly_res.get("anomalies") if anomaly_res.get("status") == "success" else None
    }
    
    # Format structured context as JSON block
    context_str = json.dumps(database_context, indent=2)
    
    # Strict system prompt
    system_prompt = (
        "You are Workforce Pulse, a workforce analytics assistant. You support operations managers and COOs.\n\n"
        "Rules:\n"
        "- Only answer using numbers and data provided in the CURRENT DATABASE CONTEXT block below.\n"
        "- Never invent or hallucinate any numbers, names, or metrics not explicitly listed in the context.\n"
        "- Every quantitative claim or metric statement MUST include an inline citation stating where it was sourced from, "
        "e.g., [source: aggregates headline] or [source: employee E005 details, compensation lookup] or [source: weekly trend].\n"
        "- If a query cannot be answered from the provided database context, state: 'I cannot answer that based on the available audit data.'\n"
        "- Keep answers brief, analytical, and professional. Avoid hidden chain-of-thought descriptions.\n"
        "- Preserve conversation context. Use active filters to query details.\n\n"
        f"--- CURRENT DATABASE CONTEXT ---\n{context_str}\n---------------------------------"
    )
    
    # Build messages list
    ai_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        ai_messages.append({"role": msg.role, "content": msg.content})
        
    # Resolve AI provider configuration (BYOK or Platform default)
    ai_config = resolve_ai_provider_config()
    api_key = ai_config.get("api_key")
    base_url = (ai_config.get("base_url") or "https://api.groq.com/openai/v1").rstrip("/")
    model = ai_config.get("model") or "llama-3.3-70b-versatile"
    source = ai_config.get("source", "platform")
    provider = ai_config.get("provider", "groq")
        
    if not api_key:
        return {
            "role": "assistant",
            "content": (
                "⚠️ **Assistant API Key Missing**\n\n"
                "No active AI API key found. Please configure your API key in **Settings** or set `GROQ_API_KEY` in environment variables."
            )
        }
        
    # Format completion endpoint url
    endpoint_url = base_url if base_url.endswith("/chat/completions") else f"{base_url}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    if "openrouter" in provider or "openrouter" in base_url:
        headers["HTTP-Referer"] = "http://localhost:3000"
        headers["X-Title"] = "Workforce Pulse"

    try:
        async with httpx.AsyncClient() as client:
            res = await client.post(
                endpoint_url,
                headers=headers,
                json={
                    "model": model,
                    "messages": ai_messages,
                    "temperature": 0.1  # Low temperature for strict factual grounding
                },
                timeout=30.0
            )
            
            if res.status_code != 200:
                error_detail = res.text
                source_label = f"BYOK ({provider})" if source == "byok" else f"Platform ({provider})"
                return {
                    "role": "assistant",
                    "content": f"⚠️ **AI Provider Error** [{source_label}] (Status {res.status_code}): {error_detail}"
                }
                
            res_data = res.json()
            completion_text = res_data["choices"][0]["message"]["content"]
            
            return {
                "role": "assistant",
                "content": completion_text
            }
            
    except Exception as e:
        return {
            "role": "assistant",
            "content": f"⚠️ **Connection Error**: Failed to reach AI endpoint ({provider}). Detail: {str(e)}"
        }
