from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from impact_analyzer_ollama import analyze_story, STORIES
from scan_repo import get_full_manifest, get_inventory_for_csi

from pydantic import BaseModel
import json, os

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
def get_stories():
    try:
        with open("data/stories.json", "r") as f:
            stories = json.load(f)
        return stories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORY_FILE = os.path.join(BASE_DIR, "data", "stories.json")

class Story(BaseModel):
    story_number: str
    story_type: str
    description: str
    acceptance_criteria: str
    impacted_csi: str


def load_stories():
    if not os.path.exists(STORY_FILE):
        return {"stories": []}
    with open(STORY_FILE, "r") as f:
        return json.load(f)


def save_stories(data):
    with open(STORY_FILE, "w") as f:
        json.dump(data, f, indent=4)


@app.post("/stories/add")
def add_story(story: Story):
    data = load_stories()

    # Check for duplicate story number
    for s in data:
        if s["story_number"] == story.story_number:
            raise HTTPException(status_code=400, detail="Story number already exists")

    # Append new story
    data.append(story.model_dump())

    # Save back to file
    save_stories(data)

    return {"message": "Story added successfully", "story": story.model_dump()}