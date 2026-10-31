# HireSmart AI – Campus Hiring & GenAI Recruitment Platform

> Complete, production-ready frontend interface built with semantic HTML5, modern CSS3 (slate/blue theme, responsive sidebar navigation, status pills, metrics cards), and Vanilla ES6+ JavaScript.

---

## 📁 Project Structure

```
frontend/
├── index.html            # Landing portal, Auth modal (Register/Login), Role selector
├── candidate.html        # Candidate portal (Profile, Upload, Jobs, Tracker, Offers)
├── recruiter.html        # Recruiter studio (Job posting, AI Leaderboard, Shortlisting)
├── interviewer.html      # Interviewer Copilot (Candidate dossier, Gemini questions, Scorecard)
├── admin.html            # Admin dashboard (15,000 Funnel KPIs, Drive & College management)
├── css/
│   └── styles.css        # Unified design system, sidebar layout, tables, badges, modals
├── js/
│   ├── mock_data.js      # Mock datasets (15,000 synthetic funnel metrics, candidates, jobs)
│   ├── auth.js           # Client-side session simulator & role-based routing
│   ├── candidate.js      # Application submission & tracking state handler
│   ├── recruiter.js      # Job posting & AI ranking trigger simulator
│   ├── interviewer.js    # Gemini question renderer & scorecard submission
│   └── admin.js          # Funnel KPI calculator & drive manager
└── README.md             # Running instructions
```

---

## 🚀 How to Run in VS Code

Because this project is built entirely with standard web technologies (HTML5, CSS3, ES6 JavaScript) and has zero dependencies or build steps, you can run it inside **Visual Studio Code** in any of the following ways:

### Method 1: Using VS Code "Live Server" Extension (Recommended)
1. In VS Code, install the extension **"Live Server"** (by *Ritwick Dey*) from the Extensions marketplace (`Ctrl+Shift+X`).
2. Open the `frontend` folder or the workspace in VS Code (`File > Open Folder...`).
3. Right-click on **`index.html`** in the file explorer.
4. Click **"Open with Live Server"**.
5. Your default browser will automatically open `http://127.0.0.1:5500/index.html`.

---

### Method 2: Direct File Open (Zero Extensions Required)
1. In VS Code, right-click on **`index.html`** in the Explorer sidebar.
2. Select **"Reveal in File Explorer"** (or press `Shift+Alt+R`).
3. Double-click **`index.html`** to open it directly in Google Chrome, Microsoft Edge, Brave, or Firefox.
4. All pages, modals, mock data, and state transitions will function interactively!

---

### Method 3: Using VS Code Integrated Terminal
Open a new terminal in VS Code (`Ctrl+\`` or `Terminal > New Terminal`) and run either:

**Using Python (built into most machines):**
```bash
# Navigate to the frontend directory if in root
cd frontend
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

**Or using Node.js / npx (if installed):**
```bash
npx serve frontend
```

---

## 👥 Pre-Configured Demo Personas

When running the application, you can use the **One-Click Live Demo Personas** on the landing page or test any role via the unified Auth modal:

| Role | Name | Email | Default Portal |
|---|---|---|---|
| **Candidate** | Aarav Sharma | `aarav.sharma@campus.iitb.ac.in` | `candidate.html` |
| **Recruiter** | Sarah Jenkins | `sarah.jenkins@hiresmart.ai` | `recruiter.html` |
| **Interviewer** | Dr. Priya Nair | `priya.nair@hiresmart.ai` | `interviewer.html` |
| **Admin** | Vikram Malhotra | `vikram.malhotra@hiresmart.ai` | `admin.html` |

*You can seamlessly switch roles at any time using the quick-switcher pills in the top header.*

---

## ✨ Features by Dashboard

- **Landing & Auth (`index.html`)**: Live funnel metrics ticker (15,000 resumes), unified modal for login/registration with demo credentials filler, and role showcase cards.
- **Candidate Portal (`candidate.html`)**: Profile editor, drag-and-drop resume parser with skill pill tags, available campus drives with CGPA threshold check, visual 4-step progress tracker, and downloadable formal offer letter.
- **Recruiter Studio (`recruiter.html`)**: Campus job posting form with dynamic skill chips, active drives table, AI candidate ranking table with **"Run AI Screening"** re-sort animation, and interview scheduling modal.
- **Interviewer Copilot (`interviewer.html`)**: Scheduled candidate dossiers, **"Generate Questions with Gemini"** button rendering 5 questions with evaluation rubrics ("What to listen for"), 1–5 competency rating sliders, and auto-drafted candidate feedback report generator.
- **Admin Control Center (`admin.html`)**: 4 KPI metric cards (15,000 resumes, 3,200 AI screened, 650 interviewed, 300 offers), funnel drop-off table with automated bottleneck alerts, college drive manager with registration modal, and 100% anonymized AI bias audit verification.
