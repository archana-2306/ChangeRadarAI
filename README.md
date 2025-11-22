🛰️ ChangeradarAI
AI-powered Change Impact Analysis from Jira Stories

ChangeradarAI automatically analyzes Jira-style user stories and identifies:

Impacted microservices

Impacted API endpoints

Downstream dependencies

Code components requiring updates

Risk level & score

Recommended QA test cases

It uses Llama 3.3 (via free Groq API) to provide fast, structured JSON impact reports for developers and QA engineers.

🚀 Why ChangeradarAI?

Modern microservice systems contain dozens of interconnected services.
Even small feature changes can ripple across multiple systems.

Developers waste hours guessing:

Which service needs a change?

Which endpoints will be affected?

What should QA test?

How risky is the change?

ChangeradarAI eliminates this guesswork.

It acts as an AI-powered architecture radar—reading stories, scanning code, analyzing dependencies, and producing developer-ready impact reports.

✨ Key Features
🔍 1. Jira Story → Microservice Impact Mapping

Automatically detects which services and endpoints will be affected.

🧭 2. Dependency Graph Reasoning

Understands downstream services, databases, and external integrations.

🛠 3. Developer Recommendations

Lists:

Files to update

Methods to modify

Potential side effects

🧪 4. QA Test Recommendations

Generates:

Unit tests

Integration paths

Security checks

Negative cases

🧮 5. Risk Scoring Engine

Based on:

Functional complexity

Data sensitivity

Security impact

Dependency fan-out

Outputs Low / Medium / High / Critical with 0–100 score.

⚡ 6. Uses Free LLM APIs

Powered by:

Groq API (Llama 3.3)

Zero local GPU needed

Sub-second inference

🧊 7. Smart Caching

Second-time screenshots are instant.

🏗 System Architecture
<img width="451" height="679" alt="image" src="https://github.com/user-attachments/assets/03321a02-02ae-4f9d-a636-5bb07f6b4df5" />


📂 Folder Structure
ChangeradarAI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── llm_client.py
│   │   ├── repos.json  (or GitHub repos)
│   │   ├── stories.json
│   │   └── cache/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile

🛠 Backend Setup
1. Install dependencies
cd backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate

pip install -r requirements.txt

2. Set API key
export GROQ_API_KEY=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

3. Run server
uvicorn main:app --reload --port 8000

🌐 Frontend Setup
cd frontend
npm install
npm run dev


Open http://localhost:5173

🧪 API Endpoints
✔ GET /stories

List available user stories.

✔ GET /repos

List configured microservices or GitHub repos.

✔ GET /impact/{story_number}

Generate or retrieve cached impact report.

✔ Example Response
{
  "cached": false,
  "result": {
    "story_number": "US-101",
    "overall_risk": "high",
    "impacted_services": [
      {
        "service_name": "AuthService",
        "impacted_endpoints": [
          "/auth/login",
          "/auth/verify-otp"
        ]
      }
    ]
  }
}

🎥 Demo Instructions

Your final demo video should:

Start backend

Start frontend

Open browser

Select story US-101 → US-105

Show:

Impacted services

Endpoints

Downstream dependencies

Components to change

Tests to run

Risk visualization

Show cache by re-running same story

End with value statement for dev + QA

Record using OBS Studio or any screen recorder.

🧩 Tech Stack
Frontend

React 18

Vite

Tailwind (optional)

shadcn/ui (optional for beauty)

Backend

FastAPI

Python

Uvicorn

Requests

AI

Groq API → Llama 3.3

Structured JSON responses

DevOps

Docker

Docker Compose

SPDX SBOM

⚠️ Limitations (Summary)

LLM may hallucinate endpoints

Risk scoring is heuristic

No authentication on backend API

JSON cache is local & non-encrypted

Prototype, not production-grade

(See docs/Limitations.md for full details.)

🔮 Future Scope

AST-based endpoint extraction

Live microservice dependency graph

CI integration (“comment impact on PR”)

Automatic unit test generation

Change heatmaps across services

On-prem LLM support for secure orgs
