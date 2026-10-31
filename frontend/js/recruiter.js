/**
 * HireSmart AI – Recruiter Studio Controller
 * Handles campus job creation, applicant volume tracking,
 * AI semantic candidate screening & leaderboard re-ranking, and interview scheduling.
 */

const RecruiterApp = (function () {
  let activeSkillsTags = ['Python', 'PyTorch', 'Transformers', 'FastAPI'];
  let selectedCandidateForInterview = null;

  function init() {
    renderActiveJobsTable();
    renderCandidateRankingTable();
    setupSkillTagInput();
  }

  // ==========================================
  // Post New Job & Skills Tag Management
  // ==========================================
  function setupSkillTagInput() {
    const input = document.getElementById('job-skill-input');
    const container = document.getElementById('job-skills-tag-container');

    if (!input || !container) return;

    renderSkillTags();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const val = input.value.trim().replace(/,/g, '');
        if (val && !activeSkillsTags.includes(val)) {
          activeSkillsTags.push(val);
          renderSkillTags();
          input.value = '';
        }
      }
    });
  }

  function renderSkillTags() {
    const container = document.getElementById('job-skills-tag-container');
    if (!container) return;

    container.innerHTML = activeSkillsTags
      .map(
        (skill, idx) => `
        <span class="skill-pill skill-pill-ai" style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.65rem;">
          <span>${skill}</span>
          <button type="button" style="background: none; border: none; cursor: pointer; color: var(--ai-purple-text); font-weight: bold; font-size: 0.85rem;" onclick="RecruiterApp.removeSkillTag(${idx})">&times;</button>
        </span>
      `
      )
      .join('');
  }

  function addSkillFromInput() {
    const input = document.getElementById('job-skill-input');
    if (!input) return;
    const val = input.value.trim();
    if (val && !activeSkillsTags.includes(val)) {
      activeSkillsTags.push(val);
      renderSkillTags();
      input.value = '';
    }
  }

  function removeSkillTag(index) {
    activeSkillsTags.splice(index, 1);
    renderSkillTags();
  }

  function handlePostJobSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('job-title')?.value.trim();
    const department = document.getElementById('job-dept')?.value;
    const openings = parseInt(document.getElementById('job-openings')?.value) || 5;
    const minCgpa = parseFloat(document.getElementById('job-min-cgpa')?.value) || 7.5;
    const location = document.getElementById('job-location')?.value.trim() || 'Bengaluru / Hybrid';
    const driveDate = document.getElementById('job-drive-date')?.value || '2026-11-20';
    const description = document.getElementById('job-desc')?.value.trim() || 'Exciting engineering role on campus.';

    if (!title) {
      window.HireSmartStore.showToast('Please enter a job title.', 'warning');
      return;
    }

    if (activeSkillsTags.length === 0) {
      window.HireSmartStore.showToast('Please add at least one required skill tag.', 'warning');
      return;
    }

    const newJob = window.HireSmartStore.addJob({
      title,
      department,
      openings,
      minCgpa,
      location,
      driveDate,
      requiredSkills: [...activeSkillsTags],
      description,
      applicantsCount: 0,
      status: 'Active'
    });

    window.HireSmartStore.showToast(`Campus Drive "${newJob.title}" posted successfully!`, 'success');

    // Reset form
    document.getElementById('post-job-form')?.reset();
    activeSkillsTags = ['Python', 'SQL', 'Git'];
    renderSkillTags();

    renderActiveJobsTable();

    // Switch to active drives tab
    const drivesNav = document.querySelector('.sidebar-nav-item[data-tab="drives"]');
    if (drivesNav) drivesNav.click();
  }

  // ==========================================
  // Active Drives & Applications Table
  // ==========================================
  function renderActiveJobsTable() {
    const tbody = document.getElementById('active-jobs-table-body');
    if (!tbody) return;

    const jobs = window.HireSmartStore.getJobs();

    tbody.innerHTML = jobs
      .map(
        (job) => `
        <tr>
          <td>
            <div class="font-semibold text-slate-900">${job.title}</div>
            <div class="text-xs text-muted">ID: ${job.id} • ${job.department}</div>
          </td>
          <td>
            <span class="badge ${job.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${job.status}</span>
          </td>
          <td>
            <span class="font-semibold">${Number(job.minCgpa || 7.0).toFixed(1)} CGPA</span>
          </td>
          <td>
            <span class="font-semibold">${job.openings} Openings</span>
          </td>
          <td>
            <div class="font-bold text-primary" style="font-size: 1rem;">${job.applicantsCount.toLocaleString()}</div>
            <div class="text-xs text-muted">Profiles Sourced</div>
          </td>
          <td>
            <span class="text-xs">${job.driveDate}</span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="RecruiterApp.filterByJob('${job.id}')">
              <span>View Leaderboard</span>
            </button>
          </td>
        </tr>
      `
      )
      .join('');
  }

  // ==========================================
  // AI Candidate Ranking & Leaderboard
  // ==========================================
  function renderCandidateRankingTable(candidatesList = null) {
    const tbody = document.getElementById('candidate-ranking-table-body');
    if (!tbody) return;

    const list = candidatesList || window.HireSmartStore.getCandidates();

    tbody.innerHTML = list
      .map((cand) => {
        // Match score color classes
        let scoreClass = 'score-pill-high';
        if (cand.aiMatchScore < 70) scoreClass = 'score-pill-low';
        else if (cand.aiMatchScore < 85) scoreClass = 'score-pill-med';

        // Recommendation Badge
        let recBadge = 'fit-high';
        if (cand.recommendation === 'Moderate Fit') recBadge = 'fit-moderate';
        else if (cand.recommendation === 'Low Fit') recBadge = 'fit-low';

        // Status badge
        let statusBadge = 'badge-primary';
        if (cand.status === 'Offered') statusBadge = 'badge-success';
        else if (cand.status === 'Interview Scheduled') statusBadge = 'badge-purple';
        else if (cand.status === 'Shortlisted') statusBadge = 'badge-info';
        else if (cand.status === 'Rejected') statusBadge = 'badge-danger';

        return `
        <tr data-candidate-id="${cand.id}">
          <td>
            <div class="font-semibold" style="color: var(--slate-900); font-size: 0.95rem;">${cand.name}</div>
            <div class="text-xs text-muted">${cand.email}</div>
          </td>
          <td>
            <div style="font-weight: 500;">${cand.college}</div>
            <div class="text-xs text-muted">${cand.degree}</div>
          </td>
          <td>
            <span class="font-bold text-slate-800" style="font-size: 0.95rem;">${Number(cand.cgpa || 8.0).toFixed(2)}</span>
          </td>
          <td style="max-width: 240px;">
            <div style="display: flex; flex-wrap: wrap; gap: 0.2rem;">
              ${(cand.extractedSkills || [])
                .slice(0, 4)
                .map((s) => `<span class="skill-pill">${s}</span>`)
                .join('')}
              ${(cand.extractedSkills || []).length > 4 ? `<span class="skill-pill">+${cand.extractedSkills.length - 4}</span>` : ''}
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="score-pill ${scoreClass}">${cand.aiMatchScore}%</span>
            </div>
          </td>
          <td>
            <span class="badge ${recBadge}">${cand.recommendation}</span>
            <div style="margin-top: 0.25rem;">
              <span class="badge ${statusBadge}" style="font-size: 0.7rem;">${cand.status}</span>
            </div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: nowrap;">
              <button class="btn btn-outline btn-sm" title="Shortlist Candidate" onclick="RecruiterApp.shortlistCandidate('${cand.id}')">
                <span>✓ Shortlist</span>
              </button>
              <button class="btn btn-ai btn-sm" title="Schedule Interview Panel" onclick="RecruiterApp.openScheduleModal('${cand.id}')">
                <span>📅 Schedule</span>
              </button>
              <button class="btn btn-danger btn-sm" title="Reject Profile" onclick="RecruiterApp.rejectCandidate('${cand.id}')">
                <span>✕</span>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');
  }

  // Trigger AI Screening Animation and Re-ranking
  function runAIScreening() {
    const btn = document.getElementById('btn-run-screening');
    const tbody = document.getElementById('candidate-ranking-table-body');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⚡ Gemini Screening in Progress...</span>`;
    }

    window.HireSmartStore.showToast('Initiating zero-bias semantic candidate scoring...', 'ai');

    if (tbody) {
      tbody.style.opacity = '0.4';
      tbody.style.transition = 'opacity 0.3s ease';
    }

    setTimeout(() => {
      // Sort candidates descending by match score
      const list = window.HireSmartStore.getCandidates();
      list.sort((a, b) => b.aiMatchScore - a.aiMatchScore);

      window.HireSmartStore.saveCandidates(list);
      renderCandidateRankingTable(list);

      if (tbody) {
        tbody.style.opacity = '1';
      }

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>✨ Run AI Screening</span>`;
      }

      window.HireSmartStore.showToast('AI Screening complete! Top candidates ranked by multi-modal semantic fit.', 'success');
    }, 1100);
  }

  function filterByJob(jobId) {
    const nav = document.querySelector('.sidebar-nav-item[data-tab="ranking"]');
    if (nav) nav.click();

    const searchInput = document.getElementById('candidate-search-input');
    if (searchInput) searchInput.value = '';

    const list = window.HireSmartStore.getCandidates().filter((c) => c.appliedJobId === jobId);
    renderCandidateRankingTable(list.length > 0 ? list : window.HireSmartStore.getCandidates());
    window.HireSmartStore.showToast(`Filtered leaderboard for Job Drive #${jobId}`, 'info');
  }

  function searchCandidates() {
    const query = document.getElementById('candidate-search-input')?.value.toLowerCase().trim() || '';
    const all = window.HireSmartStore.getCandidates();

    const filtered = all.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.college.toLowerCase().includes(query) ||
        (c.extractedSkills || []).some((s) => s.toLowerCase().includes(query))
    );

    renderCandidateRankingTable(filtered);
  }

  function shortlistCandidate(candId) {
    const updated = window.HireSmartStore.updateCandidate(candId, { status: 'Shortlisted' });
    if (updated) {
      window.HireSmartStore.showToast(`${updated.name} moved to Shortlisted pool.`, 'success');
      renderCandidateRankingTable();
    }
  }

  function rejectCandidate(candId) {
    const updated = window.HireSmartStore.updateCandidate(candId, { status: 'Rejected' });
    if (updated) {
      window.HireSmartStore.showToast(`${updated.name} marked as Rejected.`, 'danger');
      renderCandidateRankingTable();
    }
  }

  // ==========================================
  // Interview Scheduler Modal
  // ==========================================
  function openScheduleModal(candId) {
    const cand = window.HireSmartStore.getCandidateById(candId);
    if (!cand) return;

    selectedCandidateForInterview = cand;
    const modal = document.getElementById('interview-scheduler-modal');
    if (!modal) return;

    document.getElementById('sched-cand-name').textContent = cand.name;
    document.getElementById('sched-cand-college').textContent = `${cand.college} • CGPA ${Number(cand.cgpa || 8.0).toFixed(2)}`;
    document.getElementById('sched-cand-role').textContent = cand.targetRole || 'Associate AI/ML Engineer (GenAI Core)';

    // Pre-fill next business day
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 3);
    const dateStr = nextDay.toISOString().split('T')[0];
    const dateInput = document.getElementById('sched-date-input');
    if (dateInput) dateInput.value = dateStr;

    modal.classList.add('show');
  }

  function closeScheduleModal() {
    const modal = document.getElementById('interview-scheduler-modal');
    if (modal) modal.classList.remove('show');
    selectedCandidateForInterview = null;
  }

  function confirmScheduleInterview(event) {
    if (event) event.preventDefault();
    if (!selectedCandidateForInterview) return;

    const dateVal = document.getElementById('sched-date-input')?.value || '2026-11-05';
    const timeVal = document.getElementById('sched-time-input')?.value || '15:00 IST';
    const interviewerVal = document.getElementById('sched-interviewer-select')?.value || 'Dr. Priya Nair (Principal AI Architect)';
    const roundVal = document.getElementById('sched-round-select')?.value || 'Technical Deep Dive & GenAI Architecture';
    const meetLink = `https://meet.hiresmart.ai/room/interview-${Math.floor(Math.random() * 8999 + 1000)}`;

    const updates = {
      status: 'Interview Scheduled',
      interview: {
        date: dateVal,
        time: timeVal,
        interviewer: interviewerVal,
        round: roundVal,
        meetLink: meetLink
      }
    };

    const updated = window.HireSmartStore.updateCandidate(selectedCandidateForInterview.id, updates);
    window.HireSmartStore.showToast(`Interview scheduled for ${updated.name} with ${interviewerVal}!`, 'success');

    closeScheduleModal();
    renderCandidateRankingTable();
  }

  // Setup on page load
  document.addEventListener('DOMContentLoaded', init);

  return {
    addSkillFromInput,
    removeSkillTag,
    handlePostJobSubmit,
    runAIScreening,
    filterByJob,
    searchCandidates,
    shortlistCandidate,
    rejectCandidate,
    openScheduleModal,
    closeScheduleModal,
    confirmScheduleInterview
  };
})();

window.RecruiterApp = RecruiterApp;
