/**
 * HireSmart AI – Client-Side Session Simulator & Role-Based Routing
 * Manages user authentication state, demo credentials auto-fill, and multi-portal routing.
 */

const HireSmartAuth = (function () {
  // Pre-configured mock personas for one-click live evaluation
  const DEMO_PERSONAS = {
    candidate: {
      id: 'USER-CAND-001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.iitb.ac.in',
      role: 'candidate',
      roleTitle: 'Campus Candidate (Final Year CS)',
      college: 'IIT Bombay',
      candidateId: 'CAND-001',
      targetUrl: 'candidate.html'
    },
    recruiter: {
      id: 'USER-REC-002',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@hiresmart.ai',
      role: 'recruiter',
      roleTitle: 'Lead University Talent Partner',
      college: 'Global Campus Operations',
      targetUrl: 'recruiter.html'
    },
    interviewer: {
      id: 'USER-INT-003',
      name: 'Dr. Priya Nair',
      email: 'priya.nair@hiresmart.ai',
      role: 'interviewer',
      roleTitle: 'Principal AI Architect & Technical Interviewer',
      college: 'AI Research Labs',
      targetUrl: 'interviewer.html'
    },
    admin: {
      id: 'USER-ADM-004',
      name: 'Vikram Malhotra',
      email: 'vikram.malhotra@hiresmart.ai',
      role: 'admin',
      roleTitle: 'VP of University Talent Acquisition',
      college: 'Executive HR Operations',
      targetUrl: 'admin.html'
    }
  };

  function getCurrentUser() {
    let user = window.HireSmartStore ? window.HireSmartStore.getCurrentUser() : null;
    // Auto-align default persona if page was directly loaded
    if (!localStorage.getItem('hiresmart_current_user_v1')) {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('recruiter') && DEMO_PERSONAS.recruiter) user = DEMO_PERSONAS.recruiter;
      else if (path.includes('interviewer') && DEMO_PERSONAS.interviewer) user = DEMO_PERSONAS.interviewer;
      else if (path.includes('admin') && DEMO_PERSONAS.admin) user = DEMO_PERSONAS.admin;
      else if (path.includes('candidate') && DEMO_PERSONAS.candidate) user = DEMO_PERSONAS.candidate;
    }
    return user;
  }

  function loginAs(roleKey) {
    const persona = DEMO_PERSONAS[roleKey];
    if (!persona) return;

    if (window.HireSmartStore) {
      window.HireSmartStore.setCurrentUser(persona);
      window.HireSmartStore.showToast(`Logged in successfully as ${persona.name} (${persona.role.toUpperCase()})`, 'success');
    }

    setTimeout(() => {
      window.location.href = persona.targetUrl;
    }, 400);
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const roleSelect = document.getElementById('auth-role-select');
    const emailInput = document.getElementById('auth-email-input');
    const selectedRole = roleSelect ? roleSelect.value : 'candidate';
    const email = emailInput ? emailInput.value : '';

    const basePersona = DEMO_PERSONAS[selectedRole] || DEMO_PERSONAS.candidate;
    const user = {
      ...basePersona,
      email: email || basePersona.email
    };

    if (window.HireSmartStore) {
      window.HireSmartStore.setCurrentUser(user);
      window.HireSmartStore.showToast(`Authenticated as ${user.name}`, 'success');
    }

    closeAuthModal();
    setTimeout(() => {
      window.location.href = user.targetUrl;
    }, 400);
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    const nameInput = document.getElementById('reg-name-input');
    const emailInput = document.getElementById('reg-email-input');
    const roleSelect = document.getElementById('reg-role-select');

    const name = nameInput ? nameInput.value.trim() : 'New User';
    const email = emailInput ? emailInput.value.trim() : 'user@campus.ac.in';
    const role = roleSelect ? roleSelect.value : 'candidate';

    const basePersona = DEMO_PERSONAS[role] || DEMO_PERSONAS.candidate;
    const user = {
      ...basePersona,
      id: `USER-${Date.now()}`,
      name: name || basePersona.name,
      email: email || basePersona.email,
      role: role
    };

    if (window.HireSmartStore) {
      window.HireSmartStore.setCurrentUser(user);
      window.HireSmartStore.showToast(`Registration complete! Welcome, ${user.name}`, 'success');
    }

    closeAuthModal();
    setTimeout(() => {
      window.location.href = user.targetUrl;
    }, 500);
  }

  function openAuthModal(defaultRole = 'candidate', tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;

    modal.classList.add('show');
    switchAuthTab(tab);
    setAuthRole(defaultRole);
  }

  function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  function switchAuthTab(tabName) {
    const loginForm = document.getElementById('auth-login-panel');
    const regForm = document.getElementById('auth-register-panel');
    const loginTabBtn = document.getElementById('tab-btn-login');
    const regTabBtn = document.getElementById('tab-btn-register');

    if (!loginForm || !regForm) return;

    if (tabName === 'login') {
      loginForm.style.display = 'block';
      regForm.style.display = 'none';
      loginTabBtn?.classList.add('active');
      regTabBtn?.classList.remove('active');
    } else {
      loginForm.style.display = 'none';
      regForm.style.display = 'block';
      regTabBtn?.classList.add('active');
      loginTabBtn?.classList.remove('active');
    }
  }

  function setAuthRole(roleKey) {
    const roleSelect = document.getElementById('auth-role-select');
    const regRoleSelect = document.getElementById('reg-role-select');
    const emailInput = document.getElementById('auth-email-input');
    const passInput = document.getElementById('auth-password-input');

    if (roleSelect) roleSelect.value = roleKey;
    if (regRoleSelect) regRoleSelect.value = roleKey;

    // Fill demo credentials
    const persona = DEMO_PERSONAS[roleKey];
    if (persona && emailInput && passInput) {
      emailInput.value = persona.email;
      passInput.value = '••••••••••••';
    }

    // Update active state on role selector pill buttons
    document.querySelectorAll('.role-switcher-pill').forEach((pill) => {
      if (pill.dataset.role === roleKey) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Populate active user info in page sidebar and top header
  function syncDashboardHeaderUser() {
    const user = getCurrentUser();
    if (!user) return;

    // Sidebar user details
    const userNameEls = document.querySelectorAll('.dashboard-user-name');
    const userRoleEls = document.querySelectorAll('.dashboard-user-role, .user-role-label');
    const userAvatarEls = document.querySelectorAll('.dashboard-user-avatar');

    userNameEls.forEach((el) => (el.textContent = user.name));
    userRoleEls.forEach((el) => (el.textContent = user.roleTitle || user.role.toUpperCase()));

    userAvatarEls.forEach((el) => {
      const initials = user.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      el.textContent = initials;
    });

    // Mark current role in header switcher & bind instant persona-switch navigation
    document.querySelectorAll('.quick-switch-item').forEach((item) => {
      if (item.dataset.role === user.role) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
      // Ensure one-click persona switch
      if (!item._hasRoleSwitchListener) {
        item._hasRoleSwitchListener = true;
        item.addEventListener('click', (e) => {
          const role = item.dataset.role;
          if (role && DEMO_PERSONAS[role]) {
            e.preventDefault();
            loginAs(role);
          }
        });
      }
    });
  }

  // Setup sidebar collapse toggle for responsive mobile views
  function setupSidebarToggle() {
    const toggleBtn = document.querySelector('.sidebar-toggle-btn');
    const sidebar = document.querySelector('.app-sidebar');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });

      // Close when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (
          sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          !toggleBtn.contains(e.target)
        ) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  // Setup tab switcher within dashboard pages
  function setupDashboardTabs() {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-tab]');
    const tabPanels = document.querySelectorAll('.tab-content[data-tab-content]');

    if (navItems.length === 0) return;

    navItems.forEach((item) => {
      item.addEventListener('click', () => {
        const targetTab = item.dataset.tab;

        // Update active class on nav
        navItems.forEach((n) => n.classList.remove('active'));
        item.classList.add('active');

        // Update active panel
        tabPanels.forEach((panel) => {
          if (panel.dataset.tabContent === targetTab) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });

        // Update breadcrumb
        const activeBreadcrumb = document.querySelector('.breadcrumb-active');
        if (activeBreadcrumb) {
          activeBreadcrumb.textContent = item.querySelector('.nav-label')?.textContent || targetTab;
        }

        // Close sidebar on mobile after tab select
        document.querySelector('.app-sidebar')?.classList.remove('open');
      });
    });
  }

  // Universal close for any open modal
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.show').forEach((m) => {
      m.classList.remove('show');
    });
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    syncDashboardHeaderUser();
    setupSidebarToggle();
    setupDashboardTabs();

    // Close any modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });

    // Keyboard ESC to close any open modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  });

  return {
    loginAs,
    openAuthModal,
    closeAuthModal,
    switchAuthTab,
    setAuthRole,
    handleLoginSubmit,
    handleRegisterSubmit,
    getCurrentUser,
    syncDashboardHeaderUser,
    logout: () => {
      if (window.HireSmartStore) {
        window.HireSmartStore.logout();
      } else {
        window.location.href = 'index.html';
      }
    }
  };
})();

window.HireSmartAuth = HireSmartAuth;
