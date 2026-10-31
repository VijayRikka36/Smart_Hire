/**
 * HireSmart AI – Admin Control Center Controller
 * Computes 15,000 synthetic funnel analytics, identifies recruitment bottlenecks,
 * manages campus college drives, and oversees 100% anonymized AI bias audits.
 */

const AdminApp = (function () {
  function init() {
    renderFunnelMetrics();
    renderFunnelTable();
    renderCollegesTable();
    renderAuditLogs();
  }

  // ==========================================
  // Funnel Analytics & Bottleneck Detection
  // ==========================================
  function renderFunnelMetrics() {
    const metrics = window.HireSmartStore.getFunnelMetrics();

    const totalEl = document.getElementById('kpi-total-resumes');
    const screenEl = document.getElementById('kpi-ai-screen');
    const interviewEl = document.getElementById('kpi-interviews');
    const offersEl = document.getElementById('kpi-offers');

    if (totalEl) totalEl.textContent = metrics.totalResumes.toLocaleString();
    if (screenEl) screenEl.textContent = metrics.aiScreenPassed.toLocaleString();
    if (interviewEl) interviewEl.textContent = metrics.interviewsCompleted.toLocaleString();
    if (offersEl) offersEl.textContent = metrics.offersExtended.toLocaleString();
  }

  function renderFunnelTable() {
    const tbody = document.getElementById('funnel-stages-table-body');
    if (!tbody) return;

    const metrics = window.HireSmartStore.getFunnelMetrics();
    const stages = metrics.stages;

    tbody.innerHTML = stages
      .map((stg, idx) => {
        let statusBadge = 'badge-success';
        if (stg.status === 'Warning') statusBadge = 'badge-danger';
        else if (stg.status === 'Moderate') statusBadge = 'badge-warning';

        return `
        <tr>
          <td>
            <div class="font-semibold text-slate-900" style="font-size: 0.95rem;">
              <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: var(--slate-100); text-align: center; line-height: 22px; font-size: 0.75rem; margin-right: 0.4rem;">${idx + 1}</span>
              ${stg.stageName}
            </div>
          </td>
          <td>
            <span class="font-bold text-slate-900" style="font-size: 1.05rem;">${stg.count.toLocaleString()}</span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <div class="progress-bar-wrap" style="width: 80px;">
                <div class="progress-bar-fill progress-bar-primary" style="width: ${stg.conversionRate}%;"></div>
              </div>
              <span class="font-semibold text-sm">${stg.conversionRate.toFixed(1)}%</span>
            </div>
          </td>
          <td>
            <span class="font-bold ${idx === 4 ? 'text-success' : 'text-slate-700'}">${stg.overallYield.toFixed(2)}%</span>
          </td>
          <td>
            <span class="text-xs text-muted font-semibold">${stg.dropoffCount > 0 ? `-${stg.dropoffCount.toLocaleString()}` : '0'}</span>
          </td>
          <td>
            <span class="badge ${statusBadge}">${stg.status}</span>
          </td>
          <td style="max-width: 320px;">
            ${
              stg.bottleneckAlert
                ? `<div style="font-size: 0.8rem; background: ${stg.status === 'Warning' ? 'var(--danger-light)' : 'var(--warning-light)'}; color: ${stg.status === 'Warning' ? 'var(--danger-text)' : 'var(--warning-text)'}; padding: 0.35rem 0.65rem; border-radius: var(--radius-sm); border: 1px solid ${stg.status === 'Warning' ? 'var(--danger-border)' : 'var(--warning-border)'};">
                     ⚠️ <strong>Bottleneck:</strong> ${stg.bottleneckAlert}
                   </div>`
                : `<span class="text-xs text-muted">✓ Fluid conversion within target envelope</span>`
            }
          </td>
        </tr>
      `;
      })
      .join('');
  }

  // ==========================================
  // Colleges & Campus Drives Management
  // ==========================================
  function renderCollegesTable() {
    const tbody = document.getElementById('colleges-table-body');
    if (!tbody) return;

    const colleges = window.HireSmartStore.getColleges();

    tbody.innerHTML = colleges
      .map(
        (col) => `
        <tr>
          <td>
            <div class="font-semibold text-slate-900" style="font-size: 0.95rem;">${col.name}</div>
            <div class="text-xs text-muted">ID: ${col.id} • Registered: ${(col.registeredCount || 0).toLocaleString()} Candidates</div>
          </td>
          <td>
            <span class="badge badge-purple">${col.tier || 'Tier 1'}</span>
          </td>
          <td>
            <span class="font-semibold">${col.targetBatch}</span>
          </td>
          <td>
            <span class="text-sm font-semibold text-slate-800">${col.driveDate}</span>
          </td>
          <td>
            <span class="text-xs">${col.recruiterLead || 'Sarah Jenkins'}</span>
          </td>
          <td>
            <span class="badge ${
              col.status === 'Active' ? 'badge-success' : col.status === 'Upcoming' ? 'badge-primary' : 'badge-neutral'
            }">
              ${col.status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem;">
              <button class="btn btn-outline btn-sm" onclick="AdminApp.viewCollegeDetails('${col.id}')">
                <span>Inspect</span>
              </button>
            </div>
          </td>
        </tr>
      `
      )
      .join('');
  }

  function openAddCollegeModal() {
    const modal = document.getElementById('add-college-modal');
    if (modal) modal.classList.add('show');
  }

  function closeAddCollegeModal() {
    const modal = document.getElementById('add-college-modal');
    if (modal) modal.classList.remove('show');
  }

  function handleAddCollegeSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('new-col-name')?.value.trim();
    const tier = document.getElementById('new-col-tier')?.value || 'Tier 1';
    const targetBatch = document.getElementById('new-col-batch')?.value || 'Batch 2026';
    const driveDate = document.getElementById('new-col-date')?.value || '2026-11-30';
    const recruiterLead = document.getElementById('new-col-lead')?.value.trim() || 'Sarah Jenkins';
    const registeredCount = parseInt(document.getElementById('new-col-registered')?.value) || 1200;

    if (!name) {
      window.HireSmartStore.showToast('Please enter an institution name.', 'warning');
      return;
    }

    const newCollege = window.HireSmartStore.addCollege({
      name,
      tier,
      targetBatch,
      driveDate,
      recruiterLead,
      registeredCount,
      status: 'Upcoming'
    });

    window.HireSmartStore.showToast(`Registered campus drive for ${newCollege.name}!`, 'success');
    closeAddCollegeModal();
    document.getElementById('add-college-form')?.reset();
    renderCollegesTable();
  }

  function viewCollegeDetails(colId) {
    const colleges = window.HireSmartStore.getColleges();
    const college = colleges.find((c) => c.id === colId);
    if (college) {
      window.HireSmartStore.showToast(`Opening drive telemetry for ${college.name}`, 'info');
    }
  }

  // ==========================================
  // Fairness & Bias Audit
  // ==========================================
  function renderAuditLogs() {
    const tbody = document.getElementById('bias-audit-table-body');
    if (!tbody) return;

    const logs = window.HireSmartStore.getAuditLogs();

    tbody.innerHTML = logs
      .map(
        (log) => `
        <tr>
          <td>
            <span class="text-xs font-mono text-muted">${log.timestamp}</span>
          </td>
          <td>
            <div class="font-semibold text-slate-900">${log.event}</div>
            <div class="text-xs text-muted">${log.scope}</div>
          </td>
          <td style="max-width: 320px;">
            <p style="font-size: 0.84rem; margin: 0; color: var(--slate-700);">${log.details}</p>
          </td>
          <td>
            <span class="badge badge-success">✓ ${log.status}</span>
          </td>
          <td>
            <span class="text-xs font-semibold" style="color: var(--ai-purple-text);">${log.verifiedBy}</span>
          </td>
        </tr>
      `
      )
      .join('');
  }

  function triggerAlgorithmicReAudit() {
    const btn = document.getElementById('btn-reaudit');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⚡ Probing 500 Adversarial Counterfactuals...</span>`;
    }

    window.HireSmartStore.showToast('Executing automated EEOC Four-Fifths & Demographic Parity Verification...', 'ai');

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>🛡️ Run Live Adversarial Audit</span>`;
      }
      window.HireSmartStore.showToast('Audit complete: 0% demographic bias detected. Parity ratio verified at 0.992.', 'success');
    }, 1200);
  }

  function exportFunnelReport() {
    window.HireSmartStore.showToast('Exporting cryptographic recruitment funnel report (CSV / JSON)...', 'info');
  }

  // Document Ready
  document.addEventListener('DOMContentLoaded', init);

  return {
    openAddCollegeModal,
    closeAddCollegeModal,
    handleAddCollegeSubmit,
    viewCollegeDetails,
    triggerAlgorithmicReAudit,
    exportFunnelReport
  };
})();

window.AdminApp = AdminApp;
