# Backend - Bank Change Impact Analyzer (Expanded Repo)

This backend:
- Reads a **realistic mock bank monorepo** from `../mock_repo` (frontend + backend).
- Uses `scan_repo.py` to filter UI components and services by CSI (Security, Payment, User Management, etc.).
- Calls a local **Mistral** model via **Ollama** to:
  - Suggest a branch name per story.
  - Identify impacted UI components.
  - Identify impacted backend endpoints and DB fields.
  - Compute risk scores across components and services.

## Prerequisites

- Python 3.11+
- [Ollama](https://ollama.com) installed
- Mistral model available:

  ```bash
  ollama pull mistral
  ```

## Run

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## API

- `GET /health`
- `GET /stories`
- `GET /repo/manifest`
- `GET /repo/inventory/{csi}`
- `GET /impact/{story_number}`
