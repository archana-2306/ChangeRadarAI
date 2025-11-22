import requests
import json

prompt = "What is 2+2?"
try:
    print("Testing Ollama API...")
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False,
        },
        timeout=120,
    )
    print(f"Status: {response.status_code}")
    print(f"Full response: {response.text}")
    if response.status_code == 200:
        result = response.json()
        print(f"Response: {result['response'][:200]}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

