from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from impact_analyzer_ollama import analyze_story, STORIES
from scan_repo import get_full_manifest, get_inventory_for_csi

app = FastAPI(title="Bank Change Impact Analyzer (Expanded Repo)", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok"}

@app.get("/stories")
async def list_stories() -> List[Dict[str, Any]]:
    return STORIES

@app.get("/repo/manifest")
async def repo_manifest() -> Dict[str, Any]:
    return get_full_manifest()

@app.get("/repo/inventory/{csi}")
async def repo_inventory_for_csi(csi: str) -> Dict[str, Any]:
    return get_inventory_for_csi(csi)

@app.get("/impact/{story_number}")
async def impact_for_story(story_number: str) -> Dict[str, Any]:
    result = analyze_story(story_number)
    print(f"DEBUG: analyze_story result = {result}")
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
