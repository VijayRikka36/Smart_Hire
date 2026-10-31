/**
 * HireSmart AI – Interviewer Copilot Controller
 * Manages assigned interviews, candidate dossiers, Gemini question generation
 * with evaluation cues, and digital scorecards with auto-drafted candidate feedback.
 */

const InterviewerApp = (function () {
  let activeCandidate = null;

  function init() {
    renderAssignedInterviews();
    setupSliderListeners();

    // Default select first scheduled candidate (or Aarav Sharma)
    const list = getInterviewCandidates();
    if (list.length > 0) {
      selectCandidate(list[0].id);
    }
  }

  function getInterviewCandidates() {
    const all = window.HireSmartStore.getCandidates();
    // Return candidates who have an interview scheduled or completed
    const scheduled = all.filter((c) => c.interview || c.status === 'Interview Scheduled' || c.status === 'Offered');
    return scheduled.length > 0 ? scheduled : all.slice(0, 3);
  }

  function renderAssignedInterviews() {
    const container = document.getElementById('assigned-interviews-list');
    if (!container) return;

    const list = getInterviewCandidates();

    container.innerHTML = list
      .map((cand) => {
        const isSelected = activeCandidate && activeCandidate.id === cand.id;
        const hasScorecard = !!cand.scorecard;

        return `
        <div class="card" style="margin-bottom: 1rem; border: ${isSelected ? '2px solid var(--primary)' : '1px solid var(--slate-200)'}; transition: all 0.2s ease;">
          <div class="card-body" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <h3 style="font-size: 1.15rem; margin-bottom: 0.2rem;">${cand.name}</h3>
                <span class="text-xs text-muted">${cand.college} • CGPA ${cand.cgpa.toFixed(2)}</span>
              </div>
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <span class="score-pill score-pill-high">${cand.aiMatchScore}% Match</span>
                ${
                  hasScorecard
                    ? `<span class="badge badge-success">✓ Evaluated</span>`
                    : `<span class="badge badge-purple">Pending Review</span>`
                }
              </div>
            </div>

            <div style="background: var(--slate-50); border-radius: var(--radius-md); padding: 0.75rem 1rem; margin: 0.75rem 0; font-size: 0.85rem;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span class="text-muted">Target Position:</span>
                <span class="font-semibold">${cand.targetRole || 'Associate AI/ML Engineer'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                <span class="text-muted">Slot Time:</span>
                <span class="font-semibold text-primary">${cand.interview?.date || '2026-11-04'} at ${cand.interview?.time || '14:30 IST'}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span class="text-muted">Round:</span>
                <span>${cand.interview?.round || 'Technical Deep Dive'}</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
              <button class="btn btn-outline btn-sm" onclick="InterviewerApp.openVirtualRoom('${cand.id}')">
                <span>🎥 Launch Video Room</span>
              </button>
              <button class="btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="InterviewerApp.selectCandidate('${cand.id}')">
                <span>${isSelected ? 'Active in Copilot' : 'Open Dossier & Scorecard →'}</span>
              </button>
            </div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  function selectCandidate(candId) {
    const cand = window.HireSmartStore.getCandidateById(candId);
    if (!cand) return;

    activeCandidate = cand;
    renderAssignedInterviews();
    renderDossier();
    loadScorecardForm();

    // Auto-switch to dossier tab if clicked from list
    const dossierNav = document.querySelector('.sidebar-nav-item[data-tab="dossier"]');
    if (dossierNav && !dossierNav.classList.contains('active')) {
      dossierNav.click();
    }
  }

  // ==========================================
  // Candidate Dossier & Gemini AI Questions
  // ==========================================
  function renderDossier() {
    if (!activeCandidate) return;

    const nameEl = document.getElementById('dossier-name');
    const metaEl = document.getElementById('dossier-meta');
    const roleEl = document.getElementById('dossier-role');
    const scoreEl = document.getElementById('dossier-score');
    const skillsContainer = document.getElementById('dossier-skills-container');
    const projectsContainer = document.getElementById('dossier-projects-container');

    if (nameEl) nameEl.textContent = activeCandidate.name;
    if (metaEl) metaEl.textContent = `${activeCandidate.college} • ${activeCandidate.degree} • CGPA ${activeCandidate.cgpa.toFixed(2)}`;
    if (roleEl) roleEl.textContent = activeCandidate.targetRole || 'Associate AI/ML Engineer';
    if (scoreEl) scoreEl.textContent = `${activeCandidate.aiMatchScore}% AI Match`;

    if (skillsContainer) {
      skillsContainer.innerHTML = (activeCandidate.extractedSkills || [])
        .map((s) => `<span class="skill-pill skill-pill-ai">⚡ ${s}</span>`)
        .join('');
    }

    if (projectsContainer) {
      const projects = activeCandidate.projects || [
        {
          name: 'Distributed RAG Engine for Legal Discovery',
          tech: 'Python, Pinecone, LangChain, FastAPI',
          summary: 'Sub-100ms semantic retrieval across 500k contract clauses with hybrid BM25 + dense embedding re-ranking.'
        },
        {
          name: 'Multi-Agent Autonomous Code Reviewer',
          tech: 'PyTorch, Transformers, vLLM',
          summary: 'Fine-tuned CodeLlama 7B on security vulnerabilities; 34% higher detection precision than standard linters.'
        }
      ];

      projectsContainer.innerHTML = projects
        .map(
          (p) => `
          <div style="background: white; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem;">
              <h4 style="font-size: 0.95rem; color: var(--slate-900);">${p.name}</h4>
              <span class="text-xs text-primary font-semibold">${p.tech}</span>
            </div>
            <p style="font-size: 0.85rem; color: var(--slate-600); margin: 0;">${p.summary}</p>
          </div>
        `
        )
        .join('');
    }

    // Reset questions container with prompt state
    const qContainer = document.getElementById('gemini-questions-container');
    if (qContainer && qContainer.children.length === 0) {
      generateGeminiQuestions(false);
    }
  }

  // Gemini Questions Generator
  function generateGeminiQuestions(animated = true) {
    if (!activeCandidate) return;

    const btn = document.getElementById('btn-generate-questions');
    const container = document.getElementById('gemini-questions-container');
    if (!container) return;

    if (animated && btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>✨ Synthesizing Questions with Gemini 1.5 Pro...</span>`;
      window.HireSmartStore.showToast(`Analyzing ${activeCandidate.name}'s GitHub repos & projects with Gemini...`, 'ai');
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; background: white; border-radius: var(--radius-md);">
          <div style="font-size: 2rem; margin-bottom: 0.75rem;">⚡</div>
          <h4 style="color: var(--ai-purple-text); margin-bottom: 0.35rem;">Formulating Tailored Technical Rubric...</h4>
          <p class="text-xs text-muted">Correlating projects against enterprise performance standards.</p>
        </div>
      `;
    }

    const delay = animated ? 1100 : 0;

    setTimeout(() => {
      // Determine track
      let track = 'AI/ML';
      if (activeCandidate.targetRole?.includes('Full Stack')) track = 'FullStack';
      if (activeCandidate.targetRole?.includes('Data') || activeCandidate.targetRole?.includes('Distributed')) track = 'Distributed';

      const questions = window.HireSmartStore.getGeminiQuestions(track);

      container.innerHTML = questions
        .map(
          (q, idx) => {
            const rawCues = q.whatToListenFor || q.what_to_look_for || [];
            const cues = Array.isArray(rawCues) ? rawCues : [rawCues];
            const followUpText = q.followUp || q.follow_up || 'Explore edge-case performance tradeoffs.';

            return `
          <div class="gemini-question-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <div style="display: flex; gap: 0.4rem; align-items: center;">
                <span class="badge badge-purple">Q${idx + 1}: ${q.topic}</span>
                <span class="badge ${q.difficulty === 'Advanced' ? 'badge-danger' : q.difficulty === 'Behavioral' ? 'badge-info' : 'badge-warning'}">
                  ${q.difficulty}
                </span>
              </div>
              <button class="btn btn-outline btn-sm" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" onclick="InterviewerApp.copyQuestionText(this, ${idx})">
                <span>📋 Copy</span>
              </button>
            </div>

            <p style="font-weight: 600; font-size: 0.95rem; color: var(--slate-900); margin-bottom: 0.75rem; line-height: 1.5;">
              "${q.question}"
            </p>

            <!-- What to listen for cue box -->
            <div class="cue-box">
              <div class="cue-box-title">🎧 What to Listen For (Evaluation Rubric)</div>
              <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.83rem; color: var(--slate-700); line-height: 1.5;">
                ${cues.map((item) => `<li>${item}</li>`).join('')}
              </ul>
              <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--primary);">
                <strong>Suggested Deep Dive Probe:</strong> ${followUpText}
              </div>
            </div>
          </div>
        `;
          }
        )
        .join('');

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>✨ Regenerate Questions with Gemini</span>`;
      }

      if (animated) {
        window.HireSmartStore.showToast('5 tailored interview questions generated with evaluation rubrics!', 'success');
      }
    }, delay);
  }

  function copyQuestionText(btn, idx) {
    const card = btn.closest('.gemini-question-card');
    const text = card?.querySelector('p')?.textContent;
    if (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      btn.innerHTML = `<span>✓ Copied</span>`;
      setTimeout(() => (btn.innerHTML = `<span>📋 Copy</span>`), 2000);
      window.HireSmartStore.showToast('Question copied to clipboard', 'info');
    }
  }

  // ==========================================
  // Digital Scorecard & Rating Sliders
  // ==========================================
  function setupSliderListeners() {
    ['tech-rating', 'problem-rating', 'comm-rating'].forEach((id) => {
      const slider = document.getElementById(id);
      const valDisplay = document.getElementById(`${id}-val`);

      if (slider && valDisplay) {
        slider.addEventListener('input', (e) => {
          valDisplay.textContent = `${e.target.value} / 5.0`;
        });
      }
    });
  }

  function loadScorecardForm() {
    if (!activeCandidate) return;

    const candNameEl = document.getElementById('scorecard-cand-name');
    if (candNameEl) candNameEl.textContent = activeCandidate.name;

    const scorecard = activeCandidate.scorecard;
    if (scorecard) {
      const tech = document.getElementById('tech-rating');
      const prob = document.getElementById('problem-rating');
      const comm = document.getElementById('comm-rating');
      const notes = document.getElementById('interviewer-notes');

      if (tech) {
        tech.value = scorecard.techRating;
        document.getElementById('tech-rating-val').textContent = `${scorecard.techRating} / 5.0`;
      }
      if (prob) {
        prob.value = scorecard.problemSolving;
        document.getElementById('problem-rating-val').textContent = `${scorecard.problemSolving} / 5.0`;
      }
      if (comm) {
        comm.value = scorecard.commRating;
        document.getElementById('comm-rating-val').textContent = `${scorecard.commRating} / 5.0`;
      }
      if (notes) notes.value = scorecard.notes || '';
    } else {
      // Default baseline values
      const tech = document.getElementById('tech-rating');
      const prob = document.getElementById('problem-rating');
      const comm = document.getElementById('comm-rating');
      const notes = document.getElementById('interviewer-notes');

      if (tech) {
        tech.value = 4;
        document.getElementById('tech-rating-val').textContent = '4 / 5.0';
      }
      if (prob) {
        prob.value = 5;
        document.getElementById('problem-rating-val').textContent = '5 / 5.0';
      }
      if (comm) {
        comm.value = 4;
        document.getElementById('comm-rating-val').textContent = '4 / 5.0';
      }
      if (notes) {
        notes.value = 'Demonstrated solid grasp of distributed consensus and practical vector indexing tradeoffs. Articulated edge-case failure modes with high confidence.';
      }
    }
  }

  // Submit Scorecard & Auto-Draft Candidate Feedback
  function submitScorecard(event) {
    if (event) event.preventDefault();
    if (!activeCandidate) return;

    const techRating = parseInt(document.getElementById('tech-rating')?.value) || 4;
    const probRating = parseInt(document.getElementById('problem-rating')?.value) || 4;
    const commRating = parseInt(document.getElementById('comm-rating')?.value) || 4;
    const notes = document.getElementById('interviewer-notes')?.value.trim() || '';
    const recommendation = document.querySelector('input[name="eval-decision"]:checked')?.value || 'Strong Hire';

    const avgScore = ((techRating + probRating + commRating) / 3).toFixed(1);

    // Auto-draft constructive feedback report
    const feedbackDraft = `
### Interview Evaluation & Constructive Feedback Report
**Candidate:** ${activeCandidate.name} (${activeCandidate.college})
**Evaluator:** Dr. Priya Nair, Principal AI Architect
**Target Role:** ${activeCandidate.targetRole || 'Associate AI/ML Engineer'}
**Overall Assessment:** ${recommendation} (Composite Score: ${avgScore}/5.0)

#### 1. Core Technical Competence (${techRating}/5.0)
Candidate demonstrated impressive algorithmic fluency and deep practical familiarity with foundation model inference, KV-cache paging, and vector retrieval. Handled real-time latency tradeoff questions with clear, benchmark-backed justifications.

#### 2. Analytical Problem Solving (${probRating}/5.0)
Approached architectural edge cases methodically. When probed on network split-brain scenarios and data drift, structured an optimal multi-layered fallback strategy rather than settling for naive retries.

#### 3. Communication & Articulation (${commRating}/5.0)
Clear, structured whiteboard communication. Listened actively to requirements, stated assumptions explicitly upfront, and collaborated smoothly on system scaling tradeoffs.

#### 4. Qualitative Interviewer Notes
"${notes}"

#### 5. Hiring Recommendation
${
  recommendation === 'Strong Hire' || recommendation === 'Hire'
    ? 'Recommended for immediate campus offer extension under the Tier-1 engineering compensation bracket.'
    : 'Candidate demonstrates strong foundational potential; consider for secondary review or associate platform track.'
}
    `.trim();

    const scorecardData = {
      techRating,
      problemSolving: probRating,
      commRating,
      notes,
      recommendation,
      feedbackDraft,
      submittedAt: new Date().toISOString()
    };

    const updates = {
      scorecard: scorecardData
    };

    // If hire/strong hire, automatically upgrade candidate to Offered
    if (recommendation === 'Strong Hire' || recommendation === 'Hire') {
      updates.status = 'Offered';
      if (!activeCandidate.offerDetails) {
        updates.offerDetails = {
          role: activeCandidate.targetRole || 'Associate AI/ML Engineer (GenAI Core)',
          ctc: '₹24,50,000 CTC',
          baseSalary: '₹18,00,000',
          joiningBonus: '₹2,50,000',
          stockOptions: '₹4,00,000 ESOPs',
          location: 'Bengaluru Tech Center',
          joiningDate: '2026-07-01',
          offerDate: new Date().toISOString().split('T')[0],
          expiresDate: '2026-11-20'
        };
      }
    }

    activeCandidate = window.HireSmartStore.updateCandidate(activeCandidate.id, updates);

    window.HireSmartStore.showToast('Scorecard submitted! Auto-drafted candidate feedback report ready.', 'success');

    // Show Feedback Report Modal
    openFeedbackReportModal(feedbackDraft);
    renderAssignedInterviews();
  }

  function openFeedbackReportModal(feedbackText) {
    const modal = document.getElementById('feedback-report-modal');
    const content = document.getElementById('feedback-report-content');
    if (!modal || !content) return;

    // Convert basic markdown to clean HTML
    content.innerHTML = feedbackText
      .replace(/### (.*)/g, '<h3 style="color: var(--slate-900); margin: 1rem 0 0.5rem;">$1</h3>')
      .replace(/#### (.*)/g, '<h4 style="color: var(--primary); margin: 0.85rem 0 0.35rem; font-size: 0.95rem;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>');

    modal.classList.add('show');
  }

  function closeFeedbackReportModal() {
    const modal = document.getElementById('feedback-report-modal');
    if (modal) modal.classList.remove('show');
  }

  function copyFeedbackReport() {
    const text = document.getElementById('feedback-report-content')?.innerText;
    if (text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
      window.HireSmartStore.showToast('Feedback report copied to clipboard!', 'info');
    }
  }

  function openVirtualRoom(candId) {
    const cand = window.HireSmartStore.getCandidateById(candId);
    const modal = document.getElementById('interview-room-modal');
    if (!modal) return;

    document.getElementById('copilot-room-cand-name').textContent = cand ? cand.name : 'Candidate';
    modal.classList.add('show');
  }

  function closeVirtualRoomModal() {
    const modal = document.getElementById('interview-room-modal');
    if (modal) modal.classList.remove('show');
  }

  // Document ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    selectCandidate,
    generateGeminiQuestions,
    copyQuestionText,
    submitScorecard,
    closeFeedbackReportModal,
    copyFeedbackReport,
    openVirtualRoom,
    closeVirtualRoomModal
  };
})();

window.InterviewerApp = InterviewerApp;
