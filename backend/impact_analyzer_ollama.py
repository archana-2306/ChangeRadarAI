import json
import subprocess
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
import requests

BASE_DIR = Path(__file__).resolve().parent
STORIES_PATH = BASE_DIR / "data" / "stories.json"
MOCK_MODE = os.getenv("MOCK_OLLAMA", "false").lower() == "true"
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

from scan_repo import get_inventory_for_csi, get_full_manifest  # noqa: E402

def load_stories() -> List[Dict[str, Any]]:
    with STORIES_PATH.open("r", encoding="utf-8") as f:
        return json.load(f)

STORIES: List[Dict[str, Any]] = load_stories()

SYSTEM_PROMPT = """You are a senior architect and tech lead for a banking application.

You will receive:
- A single user story (with CSI: Security, Payment, or User Management)
- A filtered inventory of the codebase listing UI components and backend services relevant to that CSI
- A full manifest of all services/components for cross-service reasoning

Your tasks:
1. Suggest a Git branch name for implementing this story.
   - Format: <type>/<story-number>-<short-kebab-summary>
2. Identify FRONTEND/UI impact:
   - which UI components are affected (from the provided inventory)
   - what new fields or UI elements must be added
   - per-component risk_score 0-10
3. Identify BACKEND impact:
   - impacted services and endpoints (method + path)
   - what new request/response fields or DB fields may be needed
   - per-service risk_score 0-10
4. Cross-service risk:
   - dependencies where a change in one service might break another, with risk_score 0-10.
5. Overall risk:
   - overall_risk_level: one of ["low", "medium", "high", "critical"]
   - overall_risk_score: 0-10
6. Testing & Validation (CRITICAL for production safety):
   - List specific test cases testers should validate BEFORE prod deployment
   - Include edge cases, error scenarios, integration points
   - Specify what metrics/logs should be monitored post-deployment
   - Call out any data migration or rollback concerns

Respond ONLY with JSON in this structure:

{
  "story_number": "US-101",
  "suggested_branch_name": "feature/US-101-two-factor-login",
  "overall_summary": "short summary",
  "overall_risk_level": "low|medium|high|critical",
  "overall_risk_score": 0,
  "frontend_impacts": [
    {
      "component_name": "LoginPage",
      "file_path": "frontend/src/components/LoginPage.jsx",
      "reason": "why this component is impacted",
      "fields_to_add": [
        {"name": "otp", "type": "string", "description": "One-time password sent to email"}
      ],
      "risk_score": 0
    }
  ],
  "backend_impacts": [
    {
      "service_name": "AuthService",
      "endpoint_path": "/auth/verify-otp",
      "method": "POST",
      "reason": "why this endpoint is impacted",
      "fields_to_add": [
        {"name": "otp", "type": "string", "description": "OTP entered by user"}
      ],
      "db_changes": [
        "Add otp_secret and otp_expires_at to user auth table"
      ],
      "risk_score": 0
    }
  ],
  "cross_service_risks": [
    {
      "from_service": "AuthService",
      "to_service": "UserService",
      "reason": "how they interact and what could break",
      "risk_score": 0
    }
  ],
  "testing_and_validation": {
    "critical_test_cases": [
      "Test case 1: Happy path scenario with expected behavior",
      "Test case 2: Error handling and edge cases",
      "Test case 3: Integration with dependent services",
      "Test case 4: Performance impact on transaction throughput",
      "Test case 5: Data consistency across services"
    ],
    "edge_cases_to_validate": [
      "Concurrent requests from multiple users",
      "Timeout and retry scenarios",
      "Invalid/malformed input handling",
      "Backwards compatibility with existing data"
    ],
    "monitoring_and_alerts": [
      "Error rate threshold for this endpoint",
      "Response time SLA (e.g., p99 latency)",
      "Failed transaction logs",
      "Database lock contention metrics"
    ],
    "data_migration_risks": [
      "Any existing data that needs transformation",
      "Rollback strategy if issues detected",
      "Data validation checkpoints"
    ],
    "production_deployment_checklist": [
      "Feature flag deployment for gradual rollout",
      "Database migration order and validation",
      "Service restart sequence to prevent outages",
      "Incident response contact and escalation path"
    ]
  }
}
"""


def find_story_by_number(story_number: str) -> Optional[Dict[str, Any]]:
    for s in STORIES:
        if s.get("story_number") == story_number:
            return s
    return None


def build_user_prompt(story: Dict[str, Any]) -> str:
    csi = story.get("impacted_csi", "")
    filtered_inventory = get_inventory_for_csi(csi)
    full_manifest = get_full_manifest()
    payload = {
        "story": story,
        "filtered_inventory_for_csi": filtered_inventory,
        "full_manifest": full_manifest,
    }
    return json.dumps(payload, indent=2)


def get_mock_response(story_number: str) -> str:
    """Return a mock analysis response for testing without Ollama."""
    GITHUB_REPO_BASE = "https://github.com/archana-2306/BankApplication/tree/main"
    
    mock_responses = {
        "US-101": {
            "story_number": "US-101",
            "suggested_branch_name": "feature/US-101-two-factor-authentication",
            "overall_summary": "Add two-factor authentication to login process. Requires updates to AuthService and LoginPage component.",
            "overall_risk_level": "medium",
            "overall_risk_score": 6,
            "frontend_impacts": [
                {
                    "component_name": "LoginPage",
                    "file_path": f"{GITHUB_REPO_BASE}/frontend/src/components/LoginPage.jsx",
                    "reason": "Must display OTP input field and handle OTP verification flow",
                    "fields_to_add": [
                        {"name": "otp", "type": "string", "description": "One-time password from email"}
                    ],
                    "risk_score": 5
                }
            ],
            "backend_impacts": [
                {
                    "service_name": "AuthService",
                    "endpoint_path": "/auth/login",
                    "method": "POST",
                    "reason": "Modified to send OTP via email after initial credentials check",
                    "fields_to_add": [{"name": "otp", "type": "string"}],
                    "db_changes": ["Add otp_secret and otp_expires_at to users table"],
                    "risk_score": 7
                }
            ],
            "cross_service_risks": []
        }
    }
    
    response = mock_responses.get(story_number)
    if response:
        return json.dumps(response)
    return json.dumps({
        "story_number": story_number,
        "suggested_branch_name": f"feature/{story_number}-implementation",
        "overall_summary": "Mock response for testing",
        "overall_risk_level": "low",
        "overall_risk_score": 3,
        "frontend_impacts": [],
        "backend_impacts": [],
        "cross_service_risks": []
    })


def call_groq(prompt: str) -> str:
    """Call the Groq Cloud Chat Completions endpoint and return text/JSON.

    Returns a string. On success returns the raw response text (so existing
    JSON extraction logic can parse it). On failure returns a JSON string with
    an "error" field.
    """
    if not GROQ_API_KEY:
        return '{"error": "GROQ_API_KEY not set"}'

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "max_tokens": 8000,
    }
    try:
        resp = requests.post(url, json=data, headers=headers, timeout=300)
        # If non-200, return error JSON with full details
        if resp.status_code != 200:
            try:
                body = resp.json()
            except Exception:
                body = resp.text
            error_detail = json.dumps({"status": resp.status_code, "response": body})
            print(f"DEBUG: Groq API error - {error_detail}")
            return error_detail

        # Return response text so extract_json can parse JSON fragments if needed
        result = resp.json()
        return result.get("choices", [{}])[0].get("message", {}).get("content", "")
    except requests.Timeout:
        return '{"error": "Groq request timed out after 300 seconds"}'
    except requests.ConnectionError:
        return '{"error": "Cannot connect to Groq API"}'
    except Exception as e:
        error_msg = json.dumps({"error": f"Groq error: {str(e)}"})
        print(f"DEBUG: {error_msg}")
        return error_msg


def call_ollama_mistral(prompt: str, model: str = "mistral") -> str:
    # Use Groq API
    if GROQ_API_KEY:
        return call_groq(prompt)

    # Use mock mode if enabled (for testing when system memory is limited)
    if MOCK_MODE:
        # Extract story number from prompt for mock response
        try:
            payload = json.loads(prompt.split("USER INPUT:\n")[1])
            story_number = payload.get("story", {}).get("story_number", "US-101")
            return get_mock_response(story_number)
        except:
            return get_mock_response("US-101")
    
    # COMMENTED OUT: Ollama fallback (requires local Ollama running)
    # try:
    #     # Use Ollama HTTP API instead of subprocess
    #     response = requests.post(
    #         "http://localhost:11434/api/generate",
    #         json={
    #             "model": model,
    #             "prompt": prompt,
    #             "stream": False,
    #             "temperature": 0.1,
    #         }
    #     )
    #     response.raise_for_status()
    #     result = response.json()
    #     return result.get("response", "")
    # except requests.ConnectionError:
    #     return '{"error": "Cannot connect to Ollama. Make sure Ollama is running on http://localhost:11434"}'
    # except requests.Timeout:
    #     return '{"error": "Ollama request timed out after 300 seconds"}'
    # except Exception as e:
    #     return f'{{"error": "Ollama error: {str(e)}"}}'
    
    return '{"error": "GROQ_API_KEY not set and Ollama is disabled. Set GROQ_API_KEY environment variable."}'


def extract_json(text: str) -> Dict[str, Any]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return {"error": "No JSON object found in model output", "raw": text}
    json_str = text[start : end + 1]
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON from model output", "raw": text, "json_snippet": json_str}


def analyze_story(story_number: str) -> Dict[str, Any]:
    story = find_story_by_number(story_number)
    if not story:
        return {"error": f"Story {story_number} not found"}
    user_json = build_user_prompt(story)
    full_prompt = SYSTEM_PROMPT + "\n\nUSER INPUT:\n" + user_json
    raw_output = call_ollama_mistral(full_prompt)
    return extract_json(raw_output)
