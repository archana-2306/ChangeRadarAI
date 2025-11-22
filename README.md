# Bank Change Impact Analyzer (Expanded Mock Repo)

## Project Overview & Problem Statement

Modern banking platforms have many frontend components and microservices.
For every Jira story, developers must figure out:
- Which UI screens need changes
- Which backend services and endpoints are impacted
- Which downstream services and data models are at risk

This project provides an **intelligent impact analyzer** that:
- Scans a realistic mock bank monorepo (frontend + backend) by CSI domains (Security, Payment, User Management, etc.)
- Uses a local **Mistral** model via **Ollama** to:
  - Suggest a branch name
  - Identify impacted UI components
  - Identify impacted backend endpoints and DB fields
  - Compute risk scores across components and services

## Setup & Execution

1. Install Ollama and pull mistral:

   ```bash
   ollama pull mistral
   ```

2. Backend:

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload --port 8000
   ```

3. Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open the UI (default http://localhost:5173) and click a story to see:
   - Suggested branch name
   - Impacted UI components
   - Impacted backend endpoints
   - Fields & DB changes
   - Risk scores per component/service and overall

## High-Level Architecture Overview

- **Mock Repo Scanner**
  - Reads `mock_repo/repo_manifest.json`
  - Filters frontend components and backend services by CSI.
- **LLM Impact Service (FastAPI)**
  - Exposes `/impact/{story_number}`.
  - Combines story + CSI-filtered inventory + full manifest.
  - Calls Mistral via Ollama to generate structured JSON impact analysis.
- **React UI**
  - Lists stories.
  - Renders branch, impacts, and risk scores in a developer-friendly view.

## API Endpoint Documentation

- `GET /health` – health check
- `GET /stories` – list predefined user stories
- `GET /repo/manifest` – return full mock repo manifest
- `GET /repo/inventory/{csi}` – return subset of components/services for a CSI
- `GET /impact/{story_number}` – run full impact analysis for a story
