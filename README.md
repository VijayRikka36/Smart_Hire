# HireSmart AI – Campus Hiring & GenAI Recruitment Platform

> Comprehensive, production-ready campus recruitment platform featuring an intelligent FastAPI backend (with zero-config SQLite persistence and MySQL support, Scikit-Learn bias-free resume screening, and Gemini AI interview copilot) and an interactive multi-portal frontend built with semantic HTML5, modern CSS3, and ES6+ JavaScript.

---

## 📁 Project Structure

```
HireSmart-AI-FullPlatform/
├── run.py                    # Unified one-command launcher (FastAPI backend + frontend static hosting)
├── run.bat                   # Windows batch script for one-click startup
│
├── backend/
│   ├── main.py               # FastAPI application with JWT auth, multi-portal ATS routes & docs
│   ├── database.py           # Database engine (auto-detects MySQL or zero-config SQLite persistence)
│   ├── ai_engine.py          # Deterministic, demographic-free TF-IDF candidate ranking engine
│   ├── gemini_service.py     # Gemini GenAI service for tailored rubrics, question synthesis & offers
│   ├── resume_parser.py      # PII-redacting resume parser with engineering skill lexicon
│   ├── schema.sql            # MySQL relational schema and initial seed datasets
│   ├── hiresmart.db          # Auto-provisioned SQLite database (initialized on first boot)
│   └── requirements.txt      # Python dependencies
│
└── frontend/
    ├── index.html            # Landing portal, Auth modal (Register/Login), Role selector
    ├── candidate.html        # Candidate portal (Profile, Resume Upload, Job Drives, Visual Tracker, Offer)
    ├── recruiter.html        # Recruiter studio (Job Posting, Leaderboard, AI Screening Trigger, Scheduling)
    ├── interviewer.html      # Interviewer Copilot (Candidate Dossier, Gemini Rubrics, Scorecard & Feedback)
    ├── admin.html            # Admin dashboard (15,000 Funnel Analytics, Bottlenecks, Drives & Bias Audit)
    ├── css/
    │   └── styles.css        # Unified design system, sidebar layout, tables, badges, modals
    ├── js/
    │   ├── mock_data.js      # Mock datasets (15,000 synthetic funnel metrics, candidates, jobs)
    │   ├── auth.js           # Client-side session manager, persona quick-switching & routing
    │   ├── candidate.js      # Application submission & visual stepper tracking handler
    │   ├── recruiter.js      # Job posting & AI ranking trigger handler
    │   ├── interviewer.js    # Gemini question renderer & digital scorecard handler
    │   └── admin.js          # Funnel KPI calculator & college drive manager
    └── README.md             # Frontend-specific documentation
```

---

## 🚀 How to Run the Full Project

### Option A: One-Command Full Platform Launcher (Recommended)

Run the unified launcher from your terminal:

```bash
python run.py
```
*(Or double-click `run.bat` in Windows Explorer)*

This command automatically:
1. Detects your database (connects to MySQL if running, or auto-provisions a persistent SQLite database with seed accounts).
2. Starts the **FastAPI server on port 8000**.
3. Mounts and hosts all frontend portals directly at `http://localhost:8000`.
4. Automatically opens `http://localhost:8000` in your default browser.

#### Portals and URLs:
- **Landing & Auth**: [`http://localhost:8000/`](http://localhost:8000/)
- **Candidate Portal**: [`http://localhost:8000/candidate.html`](http://localhost:8000/candidate.html)
- **Recruiter Studio**: [`http://localhost:8000/recruiter.html`](http://localhost:8000/recruiter.html)
- **Interviewer Copilot**: [`http://localhost:8000/interviewer.html`](http://localhost:8000/interviewer.html)
- **Admin Control Center**: [`http://localhost:8000/admin.html`](http://localhost:8000/admin.html)
- **Interactive Swagger API Docs**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **System Health JSON**: [`http://localhost:8000/api/health`](http://localhost:8000/api/health)

---

### Option B: Running the Frontend Standalone

If you only wish to explore the frontend UI with local state and mock datasets:

```bash
cd frontend
python -m http.server 5500
```
Then navigate to [`http://localhost:5500`](http://localhost:5500).

*(You can also double-click `frontend/index.html` to open it directly in Chrome, Edge, or Firefox without any web server).*

---

## 👥 Demo Personas & Credentials

All test personas use the standard demo password: **`Password123!`**

| Role | Name | Email | Password | Default Portal |
|---|---|---|---|---|
| **Candidate** | Aarav Sharma | `aarav.sharma@campus.iitb.ac.in` | `Password123!` | `/candidate.html` |
| **Recruiter** | Sarah Jenkins | `sarah.jenkins@hiresmart.ai` | `Password123!` | `/recruiter.html` |
| **Interviewer** | Dr. Priya Nair | `priya.nair@hiresmart.ai` | `Password123!` | `/interviewer.html` |
| **Admin** | Vikram Malhotra | `vikram.malhotra@hiresmart.ai` | `Password123!` | `/admin.html` |

*You can switch between any role at any time by clicking the quick-switch pills in the top header.*
