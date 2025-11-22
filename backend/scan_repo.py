import json
from pathlib import Path
from typing import Any, Dict
import requests
import os

BASE_DIR = Path(__file__).resolve().parent
MOCK_REPO_ROOT = BASE_DIR.parent / "mock_repo"

# GitHub repo configuration
GITHUB_REPO = "https://github.com/archana-2306/BankApplication"
GITHUB_RAW_URL = "https://raw.githubusercontent.com/archana-2306/BankApplication/main"
GITHUB_REPO_BASE_URL = "https://github.com/archana-2306/BankApplication/tree/main"

def load_manifest() -> Dict[str, Any]:
    """Load manifest from GitHub repo or fallback to local mock_repo."""
    try:
        # Try loading from GitHub first
        manifest_url = f"{GITHUB_RAW_URL}/repo_manifest.json"
        response = requests.get(manifest_url, timeout=10)
        response.raise_for_status()
        manifest = response.json()
        
        # Update file paths to point to GitHub
        manifest = _convert_paths_to_github(manifest)
        return manifest
    except Exception as e:
        print(f"Warning: Could not load from GitHub ({e}), falling back to mock repo")
        # Fallback to local mock repo
        manifest_path = MOCK_REPO_ROOT / "repo_manifest.json"
        with manifest_path.open("r", encoding="utf-8") as f:
            return json.load(f)

def _convert_paths_to_github(manifest: Dict[str, Any]) -> Dict[str, Any]:
    """Convert local file paths to GitHub repository URLs."""
    if "frontend" in manifest:
        for component in manifest["frontend"]:
            if "file_path" in component:
                component["file_path"] = f"{GITHUB_REPO_BASE_URL}/{component['file_path']}"
    
    if "backend" in manifest:
        for service in manifest["backend"]:
            if "file_path" in service:
                service["file_path"] = f"{GITHUB_REPO_BASE_URL}/{service['file_path']}"
    
    return manifest

def get_inventory_for_csi(csi: str) -> Dict[str, Any]:
    manifest = load_manifest()
    csi_lower = csi.lower()
    frontend = [
        c for c in manifest.get("frontend", [])
        if any(csi_lower == tag.lower() for tag in c.get("csi", []))
    ]
    backend = [
        s for s in manifest.get("backend", [])
        if any(csi_lower == tag.lower() for tag in s.get("csi", []))
    ]
    return {"csi": csi, "frontend": frontend, "backend": backend}

def get_full_manifest() -> Dict[str, Any]:
    return load_manifest()
