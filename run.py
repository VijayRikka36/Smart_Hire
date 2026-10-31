"""
HireSmart AI – Unified Platform Launcher
Starts the full FastAPI backend server (which also serves the interactive frontend portals),
initializes the zero-config SQLite persistence layer, and opens the application in your browser.
"""

import os
import sys
import webbrowser
import uvicorn

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
if os.path.isdir(BACKEND_DIR):
    sys.path.insert(0, BACKEND_DIR)
else:
    # If running from root of workspace
    BACKEND_DIR = os.path.join(BASE_DIR, "HireSmart-AI-FullPlatform", "backend")
    sys.path.insert(0, BACKEND_DIR)

import main

def start():
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "127.0.0.1")
    url = f"http://localhost:{port}"

    print("=" * 70)
    print("⚡ HireSmart AI – Campus Hiring & GenAI Recruitment Platform")
    print("=" * 70)
    print(f"🚀 Application Server: {url}")
    print(f"📖 Swagger OpenAPI Docs: {url}/docs")
    print(f"✨ Interactive Portals:")
    print(f"   • Landing & Auth:      {url}/")
    print(f"   • Candidate Portal:    {url}/candidate.html")
    print(f"   • Recruiter Studio:    {url}/recruiter.html")
    print(f"   • Interviewer Copilot: {url}/interviewer.html")
    print(f"   • Admin Control:       {url}/admin.html")
    print("=" * 70)
    print("Press CTRL+C to stop the server.\n")

    # Open browser automatically after server boots
    try:
        webbrowser.open(url)
    except Exception:
        pass

    uvicorn.run("main:app", host=host, port=port, reload=False, app_dir=BACKEND_DIR)

if __name__ == "__main__":
    start()

