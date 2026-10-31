/**
 * HireSmart AI – Candidate Dashboard Controller
 * Handles profile saving, AI resume parsing, campus job applications,
 * visual stepper application tracking, and offer letter generation.
 */

const CandidateApp = (function () {
  let currentCandidate = null;

  function init() {
    loadCandidateProfile();
    renderDrivesGrid();
    renderTracker();
    renderInterviewAndOffer();
    setupDropzone();
  }

  function getActiveCandidate() {
    const user = window.HireSmartAuth ? window.HireSmartAuth.getCurrentUser() : null;
    const candId = user?.candidateId || 'CAND-001';
    let cand = window.HireSmartStore.getCandidateById(candId);
    if (!cand) {
      cand = window.HireSmartStore.getCandidates()[0];
    }
    return cand;
  }

  function loadCandidateProfile() {
    currentCandidate = getActiveCandidate();
    if (!currentCandidate) return;

    // Fill form fields
    const nameEl = document.getElementById('cand-name');
    const emailEl = document.getElementById('cand-email');
    const phoneEl = document.getElementById('cand-phone');
    const collegeEl = document.getElementById('cand-college');
    const degreeEl = document.getElementById('cand-degree');
    const cgpaEl = document.getElementById('cand-cgpa');
    const passingYearEl = document.getElementById('cand-year');
    const targetRoleEl = document.getElementById('cand-target-role');

    if (nameEl) nameEl.value = currentCandidate.name || '';
    if (emailEl) emailEl.value = currentCandidate.email || '';
    if (phoneEl) phoneEl.value = currentCandidate.phone || '+91 98765 43210';
    if (collegeEl) collegeEl.value = currentCandidate.college || '';
    if (degreeEl) degreeEl.value = currentCandidate.degree || '';
    if (cgpaEl) cgpaEl.value = currentCandidate.cgpa || '';
    if (passingYearEl) passingYearEl.value = currentCandidate.passingYear || 2026;
    if (targetRoleEl) targetRoleEl.value = currentCandidate.targetRole || '';

    renderSkillsPills('profile-skills-container', currentCandidate.extractedSkills || []);
  }

  function renderSkillsPills(containerId, skills) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!skills || skills.length === 0) {
      container.innerHTML = `<span class="text-xs text-muted">No skills parsed yet. Upload resume below.</span>`;
      return;
    }

    container.innerHTML = skills
      .map(
        (s) => `
        <span class="skill-pill skill-pill-ai">
          <span>⚡ ${s}</span>
        </span>
      `
      )
      .join('');
  }

  function saveProfile(event) {
    if (event) event.preventDefault();
    if (!currentCandidate) return;

    const updates = {
      name: document.getElementById('cand-name')?.value.trim() || currentCandidate.name,
      email: document.getElementById('cand-email')?.value.trim() || currentCandidate.email,
      phone: document.getElementById('cand-phone')?.value.trim() || currentCandidate.phone,
      college: document.getElementById('cand-college')?.value.trim() || currentCandidate.college,
      degree: document.getElementById('cand-degree')?.value.trim() || currentCandidate.degree,
      cgpa: parseFloat(document.getElementById('cand-cgpa')?.value) || currentCandidate.cgpa,
      passingYear: parseInt(document.getElementById('cand-year')?.value) || currentCandidate.passingYear,
      targetRole: document.getElementById('cand-target-role')?.value.trim() || currentCandidate.targetRole
    };

    currentCandidate = window.HireSmartStore.updateCandidate(currentCandidate.id, updates);
    window.HireSmartStore.showToast('Candidate profile updated and saved successfully!', 'success');
  }

  // Resume Upload & Extraction Simulation
  function setupDropzone() {
    const dropzone = document.getElementById('resume-dropzone');
    const fileInput = document.getElementById('resume-file-input');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleResumeFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleResumeFile(e.target.files[0]);
      }
    });
  }

  function handleResumeFile(file) {
    const fileNameEl = document.getElementById('selected-file-name');
    const uploadArea = document.getElementById('dropzone-prompt');
    const fileSelectedBox = document.getElementById('file-selected-box');

    if (fileNameEl) fileNameEl.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    if (uploadArea) uploadArea.style.display = 'none';
    if (fileSelectedBox) fileSelectedBox.style.display = 'flex';

    window.HireSmartStore.showToast(`Selected ${file.name} ready for AI parsing.`, 'info');
  }

  function triggerResumeAnalysis() {
    const resumeText = document.getElementById('resume-paste-text')?.value.trim();
    const resultBox = document.getElementById('resume-parsed-results');
    const analyzeBtn = document.getElementById('btn-analyze-resume');

    if (analyzeBtn) {
      analyzeBtn.disabled = true;
      analyzeBtn.innerHTML = `<span>⚡ Parsing with Gemini Engine...</span>`;
    }

    window.HireSmartStore.showToast('Extracting technical competencies & project embeddings...', 'ai');

    setTimeout(() => {
      let extracted = ['Python', 'PyTorch', 'LangChain', 'FastAPI', 'Docker', 'Vector DBs', 'C++', 'System Design'];
      if (resumeText && resumeText.toLowerCase().includes('react')) {
        extracted = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'TailwindCSS'];
      }

      // Update candidate record
      if (currentCandidate) {
        currentCandidate = window.HireSmartStore.updateCandidate(currentCandidate.id, {
          extractedSkills: extracted,
          aiMatchScore: 94
        });
      }

      if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = `<span>✨ Re-Analyze Resume</span>`;
      }

      if (resultBox) {
        resultBox.style.display = 'block';
        renderSkillsPills('parsed-skills-pills', extracted);
      }

      renderSkillsPills('profile-skills-container', extracted);
      window.HireSmartStore.showToast('Resume parsed! 8 verified skills mapped to campus roles.', 'success');
    }, 1200);
  }

  // Campus Drives Grid
  function renderDrivesGrid() {
    const container = document.getElementById('drives-grid-container');
    if (!container) return;

    const jobs = window.HireSmartStore.getJobs();
    const cand = currentCandidate || getActiveCandidate();

    container.innerHTML = jobs
      .map((job) => {
        const isEligible = (cand.cgpa || 8.0) >= job.minCgpa;
        const isApplied = cand.appliedJobId === job.id;

        return `
        <div class="job-card">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge ${job.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${job.status} Campus Drive</span>
              <span class="badge badge-primary">${job.openings} Openings</span>
            </div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem;">${job.title}</h3>
            <p class="text-xs text-muted" style="margin-bottom: 0.75rem;">${job.department} • 📍 ${job.location}</p>
            <p style="font-size: 0.85rem; margin-bottom: 1rem; color: var(--slate-600);">${job.description}</p>
            
            <div class="job-criteria-list">
              <div class="job-criteria-item">
                <span class="text-muted">Minimum CGPA:</span>
                <span class="font-semibold ${isEligible ? 'text-success' : 'text-danger'}">
                  ${Number(job.minCgpa || 7.0).toFixed(1)} ${isEligible ? '✓ Eligible' : '✗ Below Threshold'}
                </span>
              </div>
              <div class="job-criteria-item">
                <span class="text-muted">Drive Date:</span>
                <span class="font-semibold">${job.driveDate}</span>
              </div>
              <div class="job-criteria-item">
                <span class="text-muted">Applicants:</span>
                <span class="font-semibold">${job.applicantsCount.toLocaleString()}</span>
              </div>
            </div>

            <div style="margin-bottom: 1.25rem;">
              <span class="text-xs text-muted" style="display: block; margin-bottom: 0.35rem;">Required Tech Stack:</span>
              <div>
                ${job.requiredSkills.map((s) => `<span class="skill-pill">${s}</span>`).join('')}
              </div>
            </div>
          </div>

          <div>
            ${
              isApplied
                ? `<button class="btn btn-secondary btn-sm" style="width: 100%; cursor: default;" disabled>
                     ✓ Applied (${cand.status})
                   </button>`
                : isEligible
                ? `<button class="btn btn-primary btn-sm" style="width: 100%;" onclick="CandidateApp.applyForJob('${job.id}')">
                     Apply for Campus Drive →
                   </button>`
                : `<button class="btn btn-secondary btn-sm" style="width: 100%;" disabled title="Requires minimum CGPA of ${job.minCgpa}">
                     CGPA Ineligible (${cand.cgpa} &lt; ${job.minCgpa})
                   </button>`
            }
          </div>
        </div>
      `;
      })
      .join('');
  }

  function applyForJob(jobId) {
    const cand = currentCandidate || getActiveCandidate();
    const jobs = window.HireSmartStore.getJobs();
    const targetJob = jobs.find((j) => j.id === jobId);

    if (!targetJob) return;

    if ((cand.cgpa || 8.0) < targetJob.minCgpa) {
      window.HireSmartStore.showToast(`Cannot apply: Job requires min CGPA of ${targetJob.minCgpa}`, 'danger');
      return;
    }

    currentCandidate = window.HireSmartStore.updateCandidate(cand.id, {
      appliedJobId: jobId,
      targetRole: targetJob.title,
      status: 'Applied',
      applicationDate: new Date().toISOString().split('T')[0]
    });

    window.HireSmartStore.incrementJobApplicant(jobId);
    window.HireSmartStore.showToast(`Application submitted for ${targetJob.title}!`, 'success');

    renderDrivesGrid();
    renderTracker();
  }

  // Application Visual Stepper
  function renderTracker() {
    const cand = currentCandidate || getActiveCandidate();
    const statusEl = document.getElementById('tracker-current-status-badge');
    const roleEl = document.getElementById('tracker-job-title');
    const appliedDateEl = document.getElementById('tracker-applied-date');
    const matchScoreEl = document.getElementById('tracker-match-score');
    const progressBar = document.getElementById('tracker-progress-line');

    if (roleEl) roleEl.textContent = cand.targetRole || 'Associate AI/ML Engineer (GenAI Core)';
    if (appliedDateEl) appliedDateEl.textContent = cand.applicationDate || '2026-10-18';
    if (statusEl) {
      statusEl.className = 'badge';
      if (cand.status === 'Offered') statusEl.classList.add('badge-success');
      else if (cand.status === 'Interview Scheduled') statusEl.classList.add('badge-purple');
      else if (cand.status === 'Shortlisted') statusEl.classList.add('badge-info');
      else statusEl.classList.add('badge-primary');
      statusEl.textContent = cand.status || 'Applied';
    }

    if (matchScoreEl) {
      matchScoreEl.textContent = `${cand.aiMatchScore || 94}% AI Fit`;
    }

    // Step state calculation
    // Steps: 1: Applied, 2: Screened/Shortlisted, 3: Interview Scheduled, 4: Final Decision
    const stepOrder = {
      Applied: 1,
      Screened: 2,
      Shortlisted: 2,
      'Interview Scheduled': 3,
      Offered: 4,
      Rejected: 4
    };

    const currentStepNum = stepOrder[cand.status] || 1;

    // Update step nodes
    for (let i = 1; i <= 4; i++) {
      const node = document.getElementById(`step-node-${i}`);
      if (!node) continue;

      node.classList.remove('active', 'completed');
      if (i < currentStepNum) {
        node.classList.add('completed');
        const circle = node.querySelector('.step-circle');
        if (circle) circle.textContent = '✓';
      } else if (i === currentStepNum) {
        node.classList.add('active');
        const circle = node.querySelector('.step-circle');
        if (circle) circle.textContent = i;
      } else {
        const circle = node.querySelector('.step-circle');
        if (circle) circle.textContent = i;
      }
    }

    if (progressBar) {
      const percentages = { 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
      progressBar.style.width = percentages[currentStepNum] || '0%';
    }
  }

  // Interview & Offer Letter Presentation
  function renderInterviewAndOffer() {
    const cand = currentCandidate || getActiveCandidate();
    const interviewBox = document.getElementById('interview-schedule-card');
    const offerBox = document.getElementById('offer-letter-card');

    // Interview Details
    if (interviewBox) {
      if (cand.interview) {
        interviewBox.style.display = 'block';
        document.getElementById('int-date-time').textContent = `${cand.interview.date} at ${cand.interview.time}`;
        document.getElementById('int-interviewer').textContent = cand.interview.interviewer;
        document.getElementById('int-round').textContent = cand.interview.round;
      } else {
        interviewBox.style.display = 'none';
      }
    }

    // Offer Letter Details
    if (offerBox) {
      if (cand.status === 'Offered') {
        offerBox.style.display = 'block';
      } else {
        offerBox.style.display = 'none';
      }
    }
  }

  function openOfferLetterModal() {
    const cand = currentCandidate || getActiveCandidate();
    const modal = document.getElementById('offer-letter-modal');
    if (!modal) return;

    const offer = cand.offerDetails || {
      role: cand.targetRole || 'Associate AI/ML Engineer (GenAI Core)',
      ctc: '₹24,50,000 CTC',
      baseSalary: '₹18,00,000',
      joiningBonus: '₹2,50,000',
      stockOptions: '₹4,00,000 ESOPs (vested over 4 years)',
      location: 'Bengaluru Tech Center',
      joiningDate: '2026-07-01',
      offerDate: '2026-10-31',
      expiresDate: '2026-11-15'
    };

    document.getElementById('offer-cand-name').textContent = cand.name;
    const salutationEl = document.getElementById('offer-cand-name-salutation');
    if (salutationEl) salutationEl.textContent = cand.name;
    document.getElementById('offer-cand-college').textContent = cand.college;
    document.getElementById('offer-role-title').textContent = offer.role;
    document.getElementById('offer-ctc-value').textContent = offer.ctc;
    document.getElementById('offer-base-value').textContent = offer.baseSalary;
    document.getElementById('offer-bonus-value').textContent = offer.joiningBonus;
    document.getElementById('offer-esops-value').textContent = offer.stockOptions;
    document.getElementById('offer-joining-date').textContent = offer.joiningDate;
    document.getElementById('offer-loc-value').textContent = offer.location;

    modal.classList.add('show');
  }

  function closeOfferLetterModal() {
    const modal = document.getElementById('offer-letter-modal');
    if (modal) modal.classList.remove('show');
  }

  function acceptOffer() {
    window.HireSmartStore.showToast('Congratulations! You have accepted the formal employment offer.', 'success', 5000);
    closeOfferLetterModal();
    const acceptBtn = document.getElementById('btn-accept-offer');
    if (acceptBtn) {
      acceptBtn.disabled = true;
      acceptBtn.textContent = '✓ Offer Accepted';
    }
  }

  function downloadOfferLetter() {
    window.HireSmartStore.showToast('Downloading verified cryptographic PDF offer letter...', 'info');
    setTimeout(() => {
      window.print();
    }, 600);
  }

  function joinMockInterviewRoom() {
    const cand = currentCandidate || getActiveCandidate();
    const modal = document.getElementById('interview-room-modal');
    if (!modal) return;

    document.getElementById('mock-room-cand-name').textContent = cand.name;
    document.getElementById('mock-room-interviewer').textContent = cand.interview?.interviewer || 'Dr. Priya Nair';
    modal.classList.add('show');
  }

  function closeInterviewRoomModal() {
    const modal = document.getElementById('interview-room-modal');
    if (modal) modal.classList.remove('show');
  }

  // Fast switch candidate state for demo purposes
  function setDemoCandidateState(newStatus) {
    const cand = currentCandidate || getActiveCandidate();
    const updates = { status: newStatus };

    if (newStatus === 'Interview Scheduled' && !cand.interview) {
      updates.interview = {
        date: '2026-11-04',
        time: '14:30 IST',
        interviewer: 'Dr. Priya Nair (Principal AI Architect)',
        round: 'Technical Deep Dive & GenAI Architecture',
        meetLink: 'https://meet.hiresmart.ai/room/interview-8492'
      };
    } else if (newStatus === 'Offered' && !cand.offerDetails) {
      updates.offerDetails = {
        role: cand.targetRole || 'Associate AI/ML Engineer (GenAI Core)',
        ctc: '₹24,50,000 CTC',
        baseSalary: '₹18,00,000',
        joiningBonus: '₹2,50,000',
        stockOptions: '₹4,00,000 ESOPs',
        location: 'Bengaluru Tech Center',
        joiningDate: '2026-07-01',
        offerDate: '2026-10-31',
        expiresDate: '2026-11-15'
      };
    }

    currentCandidate = window.HireSmartStore.updateCandidate(cand.id, updates);
    window.HireSmartStore.showToast(`Demonstration state set to: ${newStatus}`, 'info');
    renderTracker();
    renderInterviewAndOffer();
    renderDrivesGrid();
  }

  // Document ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    saveProfile,
    triggerResumeAnalysis,
    applyForJob,
    openOfferLetterModal,
    closeOfferLetterModal,
    acceptOffer,
    downloadOfferLetter,
    joinMockInterviewRoom,
    closeInterviewRoomModal,
    setDemoCandidateState
  };
})();

window.CandidateApp = CandidateApp;
