/**
 * app.js - fasterwayai Real-Time AI Email Generator & Grammar Checker Engine
 * Mobile-first. Connected directly to backend server.js and System Prompt.
 */

// Global State
const state = {
  currentUser: null,
  activeView: 'landing',
  history: JSON.parse(localStorage.getItem('gf_history') || '[]'),
  currentEmailResult: null,
  currentGrammarResult: null,
  activeGrammarFilter: 'all',
  activeTemplateCategory: 'all',
  backendStatus: null,
  emailWorkspaceTab: 'form'  // 'form' | 'preview'
};

// Templates Database - 12 Professional Templates
const TEMPLATES_DATABASE = [
  // ---- CAREER ----
  {
    id: 'job-interview-followup',
    title: 'Job Interview Follow-Up',
    category: 'career',
    icon: 'work',
    description: 'Confident, polite follow-up after a job interview. Reinforces interest and key strengths.',
    purpose: 'Follow up after a job interview for a Senior Software Engineer position.',
    audience: 'Hiring Manager',
    tone: 'confident',
    length: 'standard',
    customPrompt: 'Express sincere gratitude for their time. Reiterate strong interest in the role. Briefly highlight one relevant strength. Offer to provide references or a portfolio link. Keep it professional and concise.'
  },
  {
    id: 'job-application',
    title: 'Job Application Cover Letter',
    category: 'career',
    icon: 'description',
    description: 'Compelling cover letter email to apply for a position with confidence and clarity.',
    purpose: 'Apply for a Digital Marketing Manager position.',
    audience: 'Hiring Manager / HR Department',
    tone: 'professional',
    length: 'standard',
    customPrompt: 'Express enthusiasm for the role. Briefly highlight 3 years of experience in digital marketing. Mention key skills: SEO, content strategy, and paid ads. Request an interview at their convenience.'
  },
  {
    id: 'salary-negotiation',
    title: 'Salary Negotiation Request',
    category: 'career',
    icon: 'payments',
    description: 'Professional, confident salary negotiation email based on market research and experience.',
    purpose: 'Negotiate a higher salary offer for the Software Engineer role.',
    audience: 'HR Manager / Recruiter',
    tone: 'confident',
    length: 'standard',
    customPrompt: 'Thank them for the offer. Politely reference market rates and 4 years of relevant experience. Propose a 15% salary increase. Express continued enthusiasm for joining the team.'
  },
  // ---- SALES ----
  {
    id: 'sales-cold-outreach',
    title: 'B2B Cold Sales Outreach',
    category: 'sales',
    icon: 'campaign',
    description: 'Direct, value-focused cold email proposing a quick 15-minute introductory call.',
    purpose: 'Introduce our AI productivity platform to the VP of Marketing.',
    audience: 'VP of Marketing / Decision Maker',
    tone: 'persuasive',
    length: 'concise',
    customPrompt: 'Highlight that our platform saves 40% of time on email workflows. Lead with a specific value metric. Propose a brief 15-minute call next week. Keep it punchy with a clear CTA.'
  },
  {
    id: 'sales-proposal',
    title: 'Sales Proposal Follow-Up',
    category: 'sales',
    icon: 'request_quote',
    description: 'Professional follow-up after sending a business proposal to move the deal forward.',
    purpose: 'Follow up on a business proposal sent 5 days ago for a software partnership.',
    audience: 'Business Decision Maker / CEO',
    tone: 'professional',
    length: 'concise',
    customPrompt: 'Reference the proposal sent 5 days ago. Ask if they had a chance to review it. Offer to clarify any questions or schedule a call. Create mild urgency without being pushy.'
  },
  // ---- NETWORKING ----
  {
    id: 'networking-coffee-chat',
    title: 'Informational Coffee Chat',
    category: 'networking',
    icon: 'coffee',
    description: 'Warm, respectful request for a 15-minute virtual chat with an industry mentor.',
    purpose: 'Request an informational chat about career growth in AI product management.',
    audience: 'Industry Specialist / Senior Mentor',
    tone: 'warm',
    length: 'short',
    customPrompt: 'Mention admiring their recent article on AI design systems. Keep it short and respectful. Ask for a 15-minute virtual chat at their convenience. Clearly state what you want to learn.'
  },
  {
    id: 'linkedin-connection',
    title: 'LinkedIn Connection Request',
    category: 'networking',
    icon: 'connect_without_contact',
    description: 'Short, personalized outreach to a professional connection on LinkedIn.',
    purpose: 'Connect with a senior product manager after a tech conference.',
    audience: 'Senior Product Manager',
    tone: 'warm',
    length: 'short',
    customPrompt: 'Mention meeting briefly at the conference. Express interest in their work in fintech product design. Keep it under 3 sentences. Be genuine and not salesy.'
  },
  // ---- SUPPORT ----
  {
    id: 'client-apology-delay',
    title: 'Project Delay Apology',
    category: 'support',
    icon: 'schedule_send',
    description: 'Professional, empathetic apology for a project timeline delay with a revised plan.',
    purpose: 'Apologize to a client for a 2-day delivery delay due to unexpected compliance checks.',
    audience: 'Client / Project Stakeholder',
    tone: 'apologetic',
    length: 'standard',
    customPrompt: 'Sincerely apologize without making excuses. Briefly explain the compliance check cause. Commit to final delivery on Friday by 5 PM. Reassure quality standards were maintained. Offer compensation or priority support.'
  },
  {
    id: 'customer-refund',
    title: 'Customer Refund Confirmation',
    category: 'support',
    icon: 'currency_exchange',
    description: 'Clear, empathetic customer support response confirming a processed refund.',
    purpose: 'Confirm refund processing for a cancelled subscription order.',
    audience: 'Customer',
    tone: 'professional',
    length: 'concise',
    customPrompt: 'Confirm that a refund of $49 has been processed. State it will reflect in 3-5 business days. Thank the customer for trying the service. Offer assistance if they want to re-subscribe later.'
  },
  // ---- ACADEMIC ----
  {
    id: 'assignment-extension',
    title: 'Assignment Extension Request',
    category: 'academic',
    icon: 'school',
    description: 'Respectful, honest student request for a 3-day assignment deadline extension.',
    purpose: 'Request a 3-day extension on the Research Paper assignment.',
    audience: 'Professor / Course Instructor',
    tone: 'formal',
    length: 'standard',
    customPrompt: 'Apologize for the inconvenience. State the reason is a brief medical illness earlier this week. Offer to provide a medical note if required. Request the new submission date be set to Monday. Express commitment to submitting quality work.'
  },
  {
    id: 'internship-application',
    title: 'Internship Application',
    category: 'academic',
    icon: 'work_history',
    description: 'Enthusiastic and professional internship application from a university student.',
    purpose: 'Apply for a summer internship at a tech startup in the UX design department.',
    audience: 'Internship Coordinator / HR Manager',
    tone: 'professional',
    length: 'standard',
    customPrompt: 'Express genuine enthusiasm for the company. Highlight 2nd year Computer Science background. Mention portfolio project: a mobile app redesign. Request consideration and an interview. Attach portfolio link placeholder.'
  },
  // ---- GENERAL ----
  {
    id: 'meeting-request',
    title: 'Meeting Request',
    category: 'general',
    icon: 'event',
    description: 'Professional meeting request with a clear agenda and proposed time slots.',
    purpose: 'Schedule a project kickoff meeting to align on goals and timelines.',
    audience: 'Team Lead / Colleague',
    tone: 'professional',
    length: 'concise',
    customPrompt: 'Request a 30-minute meeting to discuss the Q4 project kickoff. Propose 2 time slots: Tuesday 10 AM or Thursday 2 PM. Include a brief agenda: goals review, timeline alignment, and next steps. Keep it clear and actionable.'
  }
];

// Grammar Samples
const GRAMMAR_SAMPLES = [
  {
    title: 'Sample Business Draft',
    text: "Dear Mr. Johnson, I am writing to you regarding about our meeting yesterday. We has discussed the new project timeline and I thinks we need to adjust some dates. Me and my team has reviewed the specs and we feels confident that next Monday will be good for launch. Please let me know if this works for you or if you need any additional informations."
  },
  {
    title: 'Sample Cover Letter Excerpt',
    text: "i am writing to apply for the position of marketing manager at your company. With over five year of experience in digital campaigns i have consistently deliver good results. My former boss always say I am a fast learner and hardworking person. I would appreciate the opportunity to discuss how my skill set aligns with your needs."
  }
];

// DOM Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAuthUI();
  initMobileNav();
  initNavigation();
  initLandingPageView();
  initEmailGeneratorView();
  initGrammarCheckerView();
  initTemplatesView();
  initDashboardView();
  initSettingsModal();
  checkBackendConfig();
});

/* =====================================================
   MOBILE NAVIGATION ENGINE
   ===================================================== */
function initMobileNav() {
  const menuBtn = document.getElementById('btn-mobile-menu');
  const drawer = document.getElementById('mobile-nav-drawer');
  const overlay = document.getElementById('mobile-nav-overlay');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    menuBtn.innerHTML = '<span class="material-symbols-outlined text-[22px]">close</span>';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    menuBtn.innerHTML = '<span class="material-symbols-outlined text-[22px]">menu</span>';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (drawer.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  // Mobile drawer nav links
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      const path = link.getAttribute('data-path');
      if (path) {
        switchView(path);
        closeDrawer();
      }
    });
  });

  // Bottom nav items
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const path = item.getAttribute('data-path');
      if (path) switchView(path);
    });
  });
}

function syncMobileNavActive(viewName) {
  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    if (item.getAttribute('data-path') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Mobile drawer links
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    if (link.getAttribute('data-path') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* =====================================================
   THEME & PREFERENCES ENGINE (Light / Dark / System)
   ===================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('fasterway_theme') || localStorage.getItem('growfasting_theme') || 'system';
  applyTheme(savedTheme);

  // Listen for OS system theme updates
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem('fasterway_theme') || localStorage.getItem('growfasting_theme') || 'system';
    if (current === 'system') {
      applyTheme('system');
    }
  });
}

function applyTheme(theme) {
  localStorage.setItem('fasterway_theme', theme);
  const root = document.documentElement;
  const body = document.body;

  root.classList.remove('dark', 'light', 'dark-theme', 'light-theme');
  body.classList.remove('dark', 'light', 'dark-theme', 'light-theme');
  root.removeAttribute('data-theme');
  body.removeAttribute('data-theme');

  if (theme === 'dark') {
    root.classList.add('dark-theme', 'dark');
    body.classList.add('dark-theme', 'dark');
    root.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    root.classList.add('light-theme', 'light');
    body.classList.add('light-theme', 'light');
    root.setAttribute('data-theme', 'light');
  } else {
    // System match
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark-theme', 'dark');
      body.classList.add('dark-theme', 'dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light-theme', 'light');
      body.classList.add('light-theme', 'light');
      root.setAttribute('data-theme', 'light');
    }
  }

  updateThemeOptionsUI(theme);
}

function updateThemeOptionsUI(activeTheme) {
  const buttons = document.querySelectorAll('.theme-option-btn');
  buttons.forEach(btn => {
    const themeVal = btn.getAttribute('data-theme-value');
    if (themeVal === activeTheme) {
      btn.className = 'theme-option-btn p-3 rounded-2xl border-2 border-primary bg-primary/10 transition-all flex flex-col items-center gap-2 text-center group cursor-pointer shadow-sm';
    } else {
      btn.className = 'theme-option-btn p-3 rounded-2xl border border-outline-variant bg-surface-container-low hover:border-primary/50 transition-all flex flex-col items-center gap-2 text-center group cursor-pointer';
    }
  });
}

/* Settings Modal - Mobile Bottom Sheet & Desktop Modal */
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const openBtns = [
    document.getElementById('btn-open-settings'),
    document.getElementById('btn-open-settings-mobile')
  ];
  const closeBtn = document.getElementById('btn-close-settings');
  const saveBtn = document.getElementById('btn-save-settings');

  function openModal() {
    if (!modal) return;
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    const savedTheme = localStorage.getItem('fasterway_theme') || localStorage.getItem('growfasting_theme') || 'system';
    updateThemeOptionsUI(savedTheme);
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    modal.classList.add('hidden');
  }

  openBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (saveBtn) saveBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Theme option clicks
  const themeBtns = document.querySelectorAll('.theme-option-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.getAttribute('data-theme-value');
      if (themeVal) {
        applyTheme(themeVal);
        showToast(`Theme changed to ${themeVal.toUpperCase()} mode!`, 'success');
      }
    });
  });
}

// Check Backend AI Engine Health
async function checkBackendConfig() {
  const badge = document.getElementById('api-key-status-badge');
  const mobileStatus = document.getElementById('mobile-ai-status');
  const settingsStatus = document.getElementById('settings-ai-status');

  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      state.backendStatus = data;
      if (badge) {
        if (data.aiEngineActive) {
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block mr-1.5"></span>Real-Time AI Active`;
          badge.className = "flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400";
        } else {
          badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1.5"></span>API Key Missing`;
          badge.className = "flex items-center text-xs font-bold text-amber-600 dark:text-amber-400";
        }
      }
      if (mobileStatus) {
        if (data.aiEngineActive) {
          mobileStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span><span class="text-xs font-semibold text-emerald-800">Real-Time AI Active</span>`;
          mobileStatus.className = 'flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200';
        } else {
          mobileStatus.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span><span class="text-xs font-semibold text-amber-800">API Key Missing in .env</span>`;
          mobileStatus.className = 'flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200';
        }
      }
      if (settingsStatus && data.aiEngineActive) {
        settingsStatus.innerHTML = `<span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse inline-block shrink-0"></span><div><p class="text-label-md font-bold text-emerald-800">Real-Time AI Active</p><p class="text-body-sm text-emerald-700">Backend Gemini AI engine is connected and operational.</p></div>`;
        settingsStatus.className = 'flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200';
      }
    }
  } catch (err) {
    if (badge) {
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1.5"></span>AI Online`;
      badge.className = "flex items-center text-xs font-semibold text-blue-800";
    }
  }
}

/* Navigation Router */
function initNavigation() {
  // Desktop header nav links & hero CTA buttons
  const navLinks = document.querySelectorAll('[data-path]');
  navLinks.forEach(link => {
    // Skip bottom-nav and mobile-drawer items (handled separately)
    if (link.classList.contains('bottom-nav-item') || link.classList.contains('mobile-nav-link')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = link.getAttribute('data-path');
      if (path === 'sign-in') {
        showToast('Authentication is managed via fasterwayai user accounts.', 'info');
        return;
      }
      switchView(path);
    });
  });

  // "Go to Compose" button on preview placeholder
  const goCompose = document.getElementById('btn-go-compose');
  if (goCompose) {
    goCompose.addEventListener('click', () => switchEmailTab('form'));
  }
}

function switchView(viewName) {
  // If user tries to access workspace tools while unauthenticated, redirect to Landing Login Card
  const protectedViews = ['email-generator', 'grammar-checker', 'templates', 'dashboard'];
  if (!state.currentUser && protectedViews.includes(viewName)) {
    showToast('Please sign in or create an account to access the workspace.', 'info');
    viewName = 'landing';
    setTimeout(() => {
      const heroCard = document.getElementById('landing-auth-card');
      if (heroCard) heroCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  state.activeView = viewName;

  // Hide all views
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.add('hidden');
  });

  // Show target view
  const targetSec = document.getElementById(`view-${viewName}`);
  if (targetSec) targetSec.classList.remove('hidden');

  // Sync desktop nav
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-path') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Sync mobile nav (bottom bar + drawer)
  syncMobileNavActive(viewName);

  if (viewName === 'dashboard') renderDashboard();

  // On mobile: when switching to email-generator, reset to form tab
  if (viewName === 'email-generator' && window.innerWidth < 1024) {
    switchEmailTab('form');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Email Generator Mobile Tab Switcher */
function switchEmailTab(tab) {
  state.emailWorkspaceTab = tab;
  const formPanel = document.getElementById('panel-form');
  const previewPanel = document.getElementById('panel-preview');
  const tabForm = document.getElementById('tab-form');
  const tabPreview = document.getElementById('tab-preview');

  if (!formPanel || !previewPanel) return;

  if (tab === 'form') {
    formPanel.classList.remove('hidden-mobile');
    previewPanel.classList.add('hidden-mobile');
    tabForm?.classList.add('active');
    tabPreview?.classList.remove('active');
  } else {
    formPanel.classList.add('hidden-mobile');
    previewPanel.classList.remove('hidden-mobile');
    tabPreview?.classList.add('active');
    tabForm?.classList.remove('active');
  }
}

/* EMAIL GENERATOR WORKSPACE ENGINE */
function initEmailGeneratorView() {
  const form = document.getElementById('email-generator-form');
  const tonePills = document.querySelectorAll('.tone-pill');
  const lengthButtons = document.querySelectorAll('.length-btn');

  // Mobile tab buttons
  const tabForm = document.getElementById('tab-form');
  const tabPreview = document.getElementById('tab-preview');
  if (tabForm) tabForm.addEventListener('click', () => switchEmailTab('form'));
  if (tabPreview) tabPreview.addEventListener('click', () => switchEmailTab('preview'));

  tonePills.forEach(pill => {
    pill.addEventListener('click', () => {
      tonePills.forEach(p => p.classList.remove('bg-primary', 'text-on-primary', 'border-primary'));
      tonePills.forEach(p => p.classList.add('bg-surface-container-low', 'text-on-surface-variant'));
      pill.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
      pill.classList.add('bg-primary', 'text-on-primary', 'border-primary');
      document.getElementById('email-tone-select').value = pill.dataset.tone;
    });
  });

  lengthButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      lengthButtons.forEach(b => b.classList.remove('bg-primary-container', 'text-on-primary-container', 'border-primary'));
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'border-primary');
      document.getElementById('email-length-select').value = btn.dataset.length;
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await generateEmail();
    });
  }

  document.getElementById('btn-copy-email')?.addEventListener('click', () => {
    const emailText = document.getElementById('output-email-body')?.innerText;
    if (emailText) {
      navigator.clipboard.writeText(emailText);
      showToast('Email content copied to clipboard!', 'success');
    }
  });

  document.getElementById('btn-copy-subject')?.addEventListener('click', () => {
    const subjectText = document.getElementById('output-email-subject')?.innerText;
    if (subjectText) {
      navigator.clipboard.writeText(subjectText);
      showToast('Subject line copied!', 'success');
    }
  });

  document.getElementById('btn-send-to-grammar')?.addEventListener('click', () => {
    const emailBody = document.getElementById('output-email-body')?.innerText;
    if (emailBody) {
      document.getElementById('grammar-input-text').value = emailBody;
      switchView('grammar-checker');
      showToast('Email transferred to Grammar Refinement editor.', 'info');
    }
  });
}

// REAL-TIME EMAIL GENERATION CALL
async function generateEmail() {
  const senderName = document.getElementById('email-sender-name')?.value.trim() || '';
  const recipientName = document.getElementById('email-recipient-name')?.value.trim() || '';
  const purpose = document.getElementById('email-purpose')?.value.trim() || '';
  const audience = document.getElementById('email-audience')?.value.trim() || '';
  const tone = document.getElementById('email-tone-select')?.value || 'professional';
  const length = document.getElementById('email-length-select')?.value || 'standard';
  const customPrompt = document.getElementById('email-custom-prompt')?.value.trim() || '';

  if (!purpose && !customPrompt) {
    showToast('Please enter the email purpose or a custom AI prompt.', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-generate-email');
  const outputPlaceholder = document.getElementById('email-output-placeholder');
  const outputResult = document.getElementById('email-output-result');

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span> Generating with Real-Time AI...`;
  
  outputPlaceholder.innerHTML = `
    <div class="flex flex-col items-center justify-center p-12 text-center ai-loading-pulse">
      <div class="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4">
        <span class="material-symbols-outlined text-[32px] animate-spin">auto_awesome</span>
      </div>
      <h3 class="text-headline-sm font-bold text-on-surface mb-2">fasterwayai Real-Time AI is writing your email</h3>
      <p class="text-body-md text-on-surface-variant max-w-md">Applying tone "${tone}", sender "${senderName || 'Default'}", and recipient "${recipientName || 'Default'}"...</p>
    </div>
  `;
  outputPlaceholder.classList.remove('hidden');
  outputResult.classList.add('hidden');

  try {
    const response = await fetch('/api/generate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderName, recipientName, purpose, audience, tone, length, customPrompt })
    });

    const responseType = response.headers.get('content-type') || '';
    const responseText = await response.text();
    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      const isHtmlResponse = responseType.includes('text/html') || /<\s*!doctype|<\s*html/i.test(responseText);
      throw new Error(
        isHtmlResponse
          ? `The AI API route returned a webpage instead of JSON (HTTP ${response.status}). Please start the backend server or deploy the /api rewrite.`
          : `The AI API returned invalid JSON (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate email via backend AI.');
    }

    state.currentEmailResult = data;
    renderEmailOutput(data);

    // Firebase Analytics: track email generation
    if (typeof trackEmailGenerated === 'function') {
      trackEmailGenerated({ tone, length, customPrompt, senderName, recipientName });
    }

    // Auto-switch to Preview tab on mobile after generation
    if (window.innerWidth < 1024) {
      switchEmailTab('preview');
    }

    saveHistoryItem({
      type: 'email',
      timestamp: new Date().toISOString(),
      purpose,
      audience,
      tone,
      subject: data.subject,
      content: data.email
    });

    showToast('Email successfully generated by fasterwayai AI!', 'success');

  } catch (err) {
    console.error('Real-Time Generation Error:', err);
    showToast(`AI Generation Error: ${err.message}`, 'error');
    outputPlaceholder.innerHTML = `
      <div class="p-6 bg-error-container text-on-error-container rounded-2xl text-center max-w-md my-auto">
        <span class="material-symbols-outlined text-[36px] text-red-600 mb-2">error</span>
        <h4 class="font-bold text-headline-sm mb-1">Real-Time AI Error</h4>
        <p class="text-body-sm text-on-surface-variant mb-3">${escapeHtml(err.message)}</p>
        <p class="text-body-sm font-medium">Please check your <code>.env</code> file API key or server log.</p>
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span class="material-symbols-outlined text-[20px] mr-2">auto_awesome</span> Generate Email`;
  }
}

function renderEmailOutput(result) {
  document.getElementById('email-output-placeholder').classList.add('hidden');
  const outputResult = document.getElementById('email-output-result');
  outputResult.classList.remove('hidden');

  document.getElementById('output-email-subject').innerText = result.subject || 'Generated Subject';
      const outputEmailBody = document.getElementById('output-email-body');
      if (outputEmailBody) {
        outputEmailBody.innerText = result.email || '';
        // Remove hardcoded light-theme colors so dark theme CSS applies correctly
        outputEmailBody.style.removeProperty('color');
        outputEmailBody.style.removeProperty('background-color');
        outputEmailBody.style.removeProperty('border-color');
      }

  const altContainer = document.getElementById('output-subject-alternatives');
  if (altContainer) {
    if (result.alternatives && result.alternatives.subjectLines && result.alternatives.subjectLines.length > 0) {
      altContainer.innerHTML = result.alternatives.subjectLines.map(alt => `
        <button class="text-left px-3 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-body-sm text-on-surface transition-colors border border-surface-container flex items-center justify-between group" onclick="useAlternativeSubject('${escapeHtml(alt.replace(/'/g, "\\'"))}')">
          <span>${escapeHtml(alt)}</span>
          <span class="material-symbols-outlined text-[18px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">check_circle</span>
        </button>
      `).join('');
    } else {
      altContainer.innerHTML = '<span class="text-body-sm text-on-surface-variant">No alternative subject lines requested.</span>';
    }
  }

  const notesContainer = document.getElementById('output-email-notes');
  if (notesContainer) {
    if (result.notes && result.notes.length > 0) {
      notesContainer.parentElement.classList.remove('hidden');
      notesContainer.innerHTML = result.notes.map(note => `
        <li class="flex items-start gap-2 text-body-sm text-amber-900 font-medium">
          <span class="material-symbols-outlined text-amber-600 text-[18px] shrink-0">info</span>
          <span>${escapeHtml(note)}</span>
        </li>
      `).join('');
    } else {
      notesContainer.parentElement.classList.add('hidden');
    }
  }
}

function useAlternativeSubject(altSubject) {
  document.getElementById('output-email-subject').innerText = altSubject;
  showToast('Swapped to alternative subject line!', 'success');
}

/* GRAMMAR CHECKER WORKSPACE ENGINE */
let autoCheckTimer = null;
const AUTO_CHECK_DELAY = 2000; // 2 seconds debounce
let isAutoChecking = false;

function initGrammarCheckerView() {
  const btnCheck   = document.getElementById('btn-check-grammar');
  const btnClear   = document.getElementById('btn-clear-grammar');
  const btnApplyAll = document.getElementById('btn-apply-all-suggestions');
  const textarea   = document.getElementById('grammar-input-text');
  const autoToggle = document.getElementById('auto-check-toggle');
  const charCount  = document.getElementById('grammar-char-count');
  const samplePills = document.querySelectorAll('.sample-text-pill');

  /* ---- Manual Check Button ---- */
  if (btnCheck) {
    btnCheck.addEventListener('click', async () => {
      clearAutoCheckTimer();
      await checkGrammar();
    });
  }

  /* ---- Clear Button ---- */
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      clearAutoCheckTimer();
      textarea.value = '';
      if (charCount) charCount.textContent = '0';
      hideAutoCheckStatus();
      document.getElementById('grammar-output-placeholder').classList.remove('hidden');
      document.getElementById('grammar-output-result').classList.add('hidden');
      state.currentGrammarResult = null;
    });
  }

  /* ---- Apply All Button ---- */
  if (btnApplyAll) {
    btnApplyAll.addEventListener('click', () => {
      if (state.currentGrammarResult?.correctedText && textarea) {
        textarea.value = state.currentGrammarResult.correctedText;
        if (charCount) charCount.textContent = textarea.value.length;
        if (state.currentGrammarResult.suggestions) {
          state.currentGrammarResult.suggestions = [];
        }
        renderSuggestionsList();
        showToast('Applied all corrections to your text!', 'success');
      }
    });
  }

  /* ---- Full Corrected Text Actions ---- */
  const btnReplaceCorrected = document.getElementById('btn-replace-with-corrected');
  const btnCopyCorrected = document.getElementById('btn-copy-corrected');

  if (btnReplaceCorrected) {
    btnReplaceCorrected.addEventListener('click', () => {
      if (state.currentGrammarResult?.correctedText && textarea) {
        textarea.value = state.currentGrammarResult.correctedText;
        if (charCount) charCount.textContent = textarea.value.length;
        if (state.currentGrammarResult.suggestions) {
          state.currentGrammarResult.suggestions = [];
        }
        renderSuggestionsList();
        showToast('✅ Applied full auto-correction to your text!', 'success');
      }
    });
  }

  if (btnCopyCorrected) {
    btnCopyCorrected.addEventListener('click', () => {
      if (state.currentGrammarResult?.correctedText) {
        navigator.clipboard.writeText(state.currentGrammarResult.correctedText);
        showToast('Copied full corrected text to clipboard!', 'success');
      }
    });
  }

  /* ---- Character Counter + Auto-Check Trigger ---- */
  if (textarea) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      if (charCount) charCount.textContent = len;

      // Auto-check logic
      if (autoToggle?.checked && len >= 20) {
        clearAutoCheckTimer();
        showAutoCheckStatus('waiting');
        autoCheckTimer = setTimeout(async () => {
          if (autoToggle?.checked) {
            showAutoCheckStatus('checking');
            await checkGrammar(true); // silent = true (no toast)
            hideAutoCheckStatus();
          }
        }, AUTO_CHECK_DELAY);
      } else if (!autoToggle?.checked) {
        clearAutoCheckTimer();
        hideAutoCheckStatus();
      } else if (len < 20) {
        clearAutoCheckTimer();
        hideAutoCheckStatus();
      }
    });
  }

  /* ---- Auto-Check Toggle ---- */
  if (autoToggle) {
    autoToggle.addEventListener('change', () => {
      if (autoToggle.checked) {
        showToast('⚡ Auto Grammar Check is ON — checks 2s after you stop typing', 'success');
        // Trigger immediately if there's enough text
        const text = textarea?.value.trim() || '';
        if (text.length >= 20) {
          clearAutoCheckTimer();
          showAutoCheckStatus('checking');
          checkGrammar(true).then(() => hideAutoCheckStatus());
        }
      } else {
        clearAutoCheckTimer();
        hideAutoCheckStatus();
        showToast('Auto Grammar Check is OFF', 'info');
      }
    });
  }

  /* ---- Sample Pills ---- */
  samplePills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      if (GRAMMAR_SAMPLES[idx]) {
        textarea.value = GRAMMAR_SAMPLES[idx].text;
        if (charCount) charCount.textContent = textarea.value.length;
        showToast(`Loaded: ${GRAMMAR_SAMPLES[idx].title}`, 'info');
        // Auto-trigger if toggle is on
        if (autoToggle?.checked) {
          clearAutoCheckTimer();
          showAutoCheckStatus('checking');
          checkGrammar(true).then(() => hideAutoCheckStatus());
        }
      }
    });
  });

  /* ---- Filter Buttons ---- */
  const filterBtns = document.querySelectorAll('.grammar-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('bg-primary', 'text-on-primary'));
      btn.classList.add('bg-primary', 'text-on-primary');
      state.activeGrammarFilter = btn.dataset.category;
      renderSuggestionsList();
    });
  });
}

/* Auto-check timer helpers */
function clearAutoCheckTimer() {
  if (autoCheckTimer) {
    clearTimeout(autoCheckTimer);
    autoCheckTimer = null;
  }
}

function showAutoCheckStatus(state) {
  const bar = document.getElementById('auto-check-status');
  const txt = document.getElementById('auto-check-status-text');
  if (!bar) return;
  bar.style.display = 'flex';
  bar.classList.remove('hidden');
  if (state === 'waiting') {
    bar.className = 'flex items-center gap-2 px-3 py-2 bg-primary-fixed rounded-xl text-label-sm font-semibold text-on-primary-fixed-variant';
    if (txt) txt.textContent = 'Will auto-check in 2 seconds...';
    bar.querySelector('.material-symbols-outlined').classList.remove('animate-spin');
    bar.querySelector('.material-symbols-outlined').textContent = 'schedule';
  } else {
    bar.className = 'flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl text-label-sm font-semibold text-emerald-800 border border-emerald-200';
    if (txt) txt.textContent = 'Analyzing with AI...';
    bar.querySelector('.material-symbols-outlined').classList.add('animate-spin');
    bar.querySelector('.material-symbols-outlined').textContent = 'progress_activity';
  }
}

function hideAutoCheckStatus() {
  const bar = document.getElementById('auto-check-status');
  if (bar) {
    bar.style.display = 'none';
    bar.classList.add('hidden');
  }
}

// REAL-TIME GRAMMAR CHECK CALL
// silent=true skips loading animation and success toast (used for auto-check)
async function checkGrammar(silent = false) {
  const text = document.getElementById('grammar-input-text').value.trim();
  if (!text) {
    if (!silent) showToast('Please enter or paste text to analyze.', 'error');
    return;
  }

  const btnCheck = document.getElementById('btn-check-grammar');
  const placeholder = document.getElementById('grammar-output-placeholder');
  const resultContainer = document.getElementById('grammar-output-result');

  btnCheck.disabled = true;

  if (!silent) {
    btnCheck.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span> Analyzing...`;
    placeholder.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-center ai-loading-pulse my-auto">
        <div class="w-14 h-14 rounded-2xl bg-primary-container/20 text-primary flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-[32px] animate-spin">spellcheck</span>
        </div>
        <h3 class="text-headline-sm font-bold text-on-surface mb-2">Analyzing Grammar & Tone</h3>
        <p class="text-body-md text-on-surface-variant">Performing linguistic analysis across spelling, syntax, clarity, and tone...</p>
      </div>
    `;
    placeholder.classList.remove('hidden');
    resultContainer.classList.add('hidden');
  } else {
    // Silent mode: just keep result visible while updating
    btnCheck.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px] mr-2">progress_activity</span> Auto-checking...`;
  }

  try {
    const response = await fetch('/api/check-grammar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to check grammar via backend AI.');
    }

    state.currentGrammarResult = data;
    renderGrammarResults(data);

    // Firebase Analytics: track grammar check
    if (typeof trackGrammarChecked === 'function') {
      trackGrammarChecked({
        charCount: text.length,
        autoMode: silent,
        suggestionCount: data.suggestions?.length || 0
      });
    }

    saveHistoryItem({
      type: 'grammar',
      timestamp: new Date().toISOString(),
      original: text,
      corrected: data.correctedText,
      summary: data.summary
    });

    if (!silent) {
      showToast('Linguistic analysis complete!', 'success');
    } else {
      showToast('Auto-check complete!', 'success');
    }

  } catch (err) {
    console.error('Real-Time Grammar Error:', err);
    if (!silent) {
      showToast(`Grammar Error: ${err.message}`, 'error');
      placeholder.innerHTML = `
        <div class="p-6 bg-error-container text-on-error-container rounded-2xl text-center max-w-md my-auto">
          <span class="material-symbols-outlined text-[36px] text-red-600 mb-2">error</span>
          <h4 class="font-bold text-headline-sm mb-1">Analysis Error</h4>
          <p class="text-body-sm text-on-surface-variant mb-3">${escapeHtml(err.message)}</p>
        </div>
      `;
    }
  } finally {
    btnCheck.disabled = false;
    btnCheck.innerHTML = `<span class="material-symbols-outlined text-[20px] mr-2">auto_fix_high</span> Check Grammar & Tone`;
  }

}

function renderGrammarResults(result) {
  document.getElementById('grammar-output-placeholder').classList.add('hidden');
  const container = document.getElementById('grammar-output-result');
  container.classList.remove('hidden');

  document.getElementById('grammar-summary-text').innerText = result.summary || 'Analysis complete.';

  if (result.tone) {
    document.getElementById('tone-detected-badge').innerText = result.tone.detected || 'Neutral';
    document.getElementById('tone-assessment-text').innerText = result.tone.assessment || '';
  }

  // Display Full AI Corrected Text Preview Box
  const correctedContainer = document.getElementById('corrected-text-container');
  const correctedPreview = document.getElementById('corrected-text-preview');

  if (result.correctedText && correctedContainer && correctedPreview) {
    correctedPreview.innerText = result.correctedText;
    correctedContainer.classList.remove('hidden');
  } else if (correctedContainer) {
    correctedContainer.classList.add('hidden');
  }

  renderSuggestionsList();
}

function renderSuggestionsList() {
  const listEl = document.getElementById('grammar-suggestions-list');
  if (!listEl || !state.currentGrammarResult) return;

  const suggestions = state.currentGrammarResult.suggestions || [];
  const filter = state.activeGrammarFilter;

  const filtered = filter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category.toLowerCase() === filter.toLowerCase());

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div class="p-6 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
        <span class="material-symbols-outlined text-green-600 text-[32px] mb-1">check_circle</span>
        <p class="font-bold text-on-surface">No ${filter === 'all' ? '' : filter} suggestions found!</p>
        <p class="text-body-sm">Your text is grammatically clear and natural.</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map((sug, realIdx) => {
    const originalIndex = suggestions.indexOf(sug);
    const priorityColor = sug.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' : sug.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';
    
    return `
      <div class="p-4 rounded-xl border border-surface-container bg-surface-container-lowest hover:border-outline-variant transition-all flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-label-sm font-bold uppercase tracking-wider border ${priorityColor}">
              ${escapeHtml(sug.category)}
            </span>
            <span class="text-body-sm text-on-surface-variant capitalize">• ${escapeHtml(sug.priority)} Priority</span>
          </div>
          <button class="px-3 py-1 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary text-label-sm font-semibold rounded-lg transition-colors flex items-center gap-1" onclick="acceptSuggestionByIndex(${originalIndex})">
            <span class="material-symbols-outlined text-[16px]">done</span> Accept
          </button>
        </div>

        <div class="flex items-center gap-3 text-body-md font-medium flex-wrap">
          <span class="line-through text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">${escapeHtml(sug.original)}</span>
          <span class="material-symbols-outlined text-on-surface-variant text-[16px]">arrow_forward</span>
          <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">${escapeHtml(sug.replacement)}</span>
        </div>

        <p class="text-body-sm text-on-surface-variant">${escapeHtml(sug.reason)}</p>
      </div>
    `;
  }).join('');
}

function acceptSuggestionByIndex(idx) {
  const suggestions = state.currentGrammarResult?.suggestions;
  if (!suggestions || !suggestions[idx]) return;

  const sug = suggestions[idx];
  const textarea = document.getElementById('grammar-input-text');
  const charCount = document.getElementById('grammar-char-count');

  if (textarea && sug.original && sug.replacement) {
    const escapedOrig = sug.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedOrig, 'i');

    if (regex.test(textarea.value)) {
      textarea.value = textarea.value.replace(regex, sug.replacement);
    } else {
      textarea.value = textarea.value.replace(sug.original, sug.replacement);
    }

    if (charCount) charCount.textContent = textarea.value.length;

    // Remove accepted suggestion from state and re-render
    suggestions.splice(idx, 1);
    renderSuggestionsList();
    showToast(`Applied fix: "${sug.replacement}"`, 'success');
  }
}

/* TEMPLATES LIBRARY VIEW */
function initTemplatesView() {
  renderTemplatesList();

  const categoryBtns = document.querySelectorAll('.template-category-btn');
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Reset all buttons to inactive style
      categoryBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-on-primary');
        b.classList.add('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-surface-container');
      });
      // Set active button style
      btn.classList.add('bg-primary', 'text-on-primary');
      btn.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant', 'border', 'border-surface-container');
      state.activeTemplateCategory = btn.dataset.category;
      renderTemplatesList();
    });
  });

  const searchInput = document.getElementById('templates-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderTemplatesList();
    });
  }
}

function renderTemplatesList() {
  const container = document.getElementById('templates-grid-container');
  if (!container) return;

  const category = state.activeTemplateCategory;
  const search = (document.getElementById('templates-search-input')?.value || '').toLowerCase();

  const filtered = TEMPLATES_DATABASE.filter(t => {
    const matchesCat = category === 'all' || t.category === category;
    const matchesSearch = !search || t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search) || t.category.toLowerCase().includes(search);
    return matchesCat && matchesSearch;
  });

  // Category color map
  const categoryColors = {
    career:     { bg: 'bg-blue-100',   text: 'text-blue-800',   icon: 'text-blue-600',   ring: 'bg-blue-50' },
    sales:      { bg: 'bg-orange-100', text: 'text-orange-800', icon: 'text-orange-600', ring: 'bg-orange-50' },
    networking: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-600', ring: 'bg-purple-50' },
    support:    { bg: 'bg-emerald-100',text: 'text-emerald-800',icon: 'text-emerald-600',ring: 'bg-emerald-50' },
    academic:   { bg: 'bg-amber-100',  text: 'text-amber-800',  icon: 'text-amber-600',  ring: 'bg-amber-50' },
    general:    { bg: 'bg-slate-100',  text: 'text-slate-800',  icon: 'text-slate-600',  ring: 'bg-slate-50' }
  };

  const toneLabels = {
    professional: 'Professional',
    formal:       'Formal',
    warm:         'Warm',
    concise:      'Concise',
    persuasive:   'Persuasive',
    apologetic:   'Apologetic',
    confident:    'Confident',
    neutral:      'Neutral'
  };

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-surface-container">
        <span class="material-symbols-outlined text-[48px] mb-3 opacity-40 block">search_off</span>
        <p class="text-headline-sm text-on-surface mb-1 font-bold">No templates found</p>
        <p class="text-body-md">Try a different keyword or category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const colors = categoryColors[t.category] || categoryColors.general;
    const toneLabel = toneLabels[t.tone] || t.tone;
    return `
    <div class="bg-surface-container-lowest rounded-2xl border border-surface-container hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col group overflow-hidden">
      <!-- Card Top: Icon + Category Badge -->
      <div class="p-5 flex-grow">
        <div class="flex items-start justify-between mb-4">
          <div class="w-11 h-11 rounded-xl ${colors.ring} ${colors.icon} flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px]">${t.icon || 'mail'}</span>
          </div>
          <span class="px-2.5 py-1 ${colors.bg} ${colors.text} rounded-full text-label-sm font-bold uppercase tracking-wider">${escapeHtml(t.category)}</span>
        </div>

        <h3 class="text-headline-sm font-bold text-on-surface mb-2 group-hover:text-primary transition-colors leading-snug">${escapeHtml(t.title)}</h3>
        <p class="text-body-sm text-on-surface-variant leading-relaxed mb-3">${escapeHtml(t.description)}</p>

        <!-- Meta tags -->
        <div class="flex flex-wrap gap-1.5">
          <span class="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-lg text-label-sm font-medium">${toneLabel}</span>
          <span class="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-lg text-label-sm font-medium capitalize">📏 ${escapeHtml(t.length)}</span>
        </div>
      </div>

      <!-- Card Footer: Two Buttons -->
      <div class="px-5 pb-5 pt-3 border-t border-surface-container flex gap-2">
        <button
          class="flex-1 px-3 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          onclick="useTemplate('${t.id}', false)">
          <span class="material-symbols-outlined text-[16px]">edit</span>
          Load
        </button>
        <button
          class="flex-1 px-3 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          onclick="generateFromTemplate('${t.id}')">
          <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
          Generate
        </button>
      </div>
    </div>
  `;
  }).join('');
}

function useTemplate(templateId, autoGenerate = false) {
  const t = TEMPLATES_DATABASE.find(item => item.id === templateId);
  if (!t) return;

  // Switch to email generator view first
  switchView('email-generator');

  // On mobile: ensure Compose tab is shown first
  if (window.innerWidth < 1024) {
    switchEmailTab('form');
  }

  // Populate all form fields
  const purposeEl = document.getElementById('email-purpose');
  const audienceEl = document.getElementById('email-audience');
  const toneSelectEl = document.getElementById('email-tone-select');
  const lengthSelectEl = document.getElementById('email-length-select');
  const customPromptEl = document.getElementById('email-custom-prompt');
  const senderEl = document.getElementById('email-sender-name');
  const recipientEl = document.getElementById('email-recipient-name');

  if (purposeEl) purposeEl.value = t.purpose;
  if (audienceEl) audienceEl.value = t.audience;
  if (toneSelectEl) toneSelectEl.value = t.tone;
  if (lengthSelectEl) lengthSelectEl.value = t.length;
  if (customPromptEl) customPromptEl.value = t.customPrompt || '';

  // Clear sender/recipient so user can fill — or keep existing values
  if (senderEl && !senderEl.value.trim()) senderEl.placeholder = 'e.g. Your Name';
  if (recipientEl && !recipientEl.value.trim()) recipientEl.placeholder = t.audience;

  // Sync tone pills
  const tonePills = document.querySelectorAll('.tone-pill');
  tonePills.forEach(p => {
    if (p.dataset.tone === t.tone) {
      p.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
      p.classList.add('bg-primary', 'text-on-primary', 'border-primary');
    } else {
      p.classList.remove('bg-primary', 'text-on-primary', 'border-primary');
      p.classList.add('bg-surface-container-low', 'text-on-surface-variant');
    }
  });

  // Sync length buttons
  const lengthBtns = document.querySelectorAll('.length-btn');
  lengthBtns.forEach(b => {
    if (b.dataset.length === t.length) {
      b.classList.add('bg-primary-container', 'text-on-primary-container', 'border-primary');
      b.classList.remove('border-outline-variant');
    } else {
      b.classList.remove('bg-primary-container', 'text-on-primary-container', 'border-primary');
      b.classList.add('border-outline-variant');
    }
  });

  showToast(`✅ "${t.title}" loaded! Click Generate Email to create it.`, 'success');

  // Firebase Analytics: track template usage
  if (typeof trackTemplateUsed === 'function') {
    trackTemplateUsed({ templateId: t.id, category: t.category, autoGenerate });
  }

  // Auto-generate if requested ("Generate Now" button)
  if (autoGenerate) {
    setTimeout(() => {
      generateEmail();
    }, 300);
  } else {
    // Scroll to top of form smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function generateFromTemplate(templateId) {
  useTemplate(templateId, true);
}

/* DASHBOARD VIEW ENGINE */
function initDashboardView() {
  renderDashboard();
}

function renderDashboard() {
  const totalEmails = state.history.filter(h => h.type === 'email').length;
  const totalGrammar = state.history.filter(h => h.type === 'grammar').length;
  const totalActions = totalEmails + totalGrammar;
  const timeSavedMinutes = Math.round(totalActions * 15);

  document.getElementById('dash-stat-emails').innerText = totalEmails;
  document.getElementById('dash-stat-grammar').innerText = totalGrammar;
  document.getElementById('dash-stat-words').innerText = (totalActions * 180).toLocaleString();
  document.getElementById('dash-stat-time').innerText = `${timeSavedMinutes} mins`;

  const historyList = document.getElementById('dash-history-list');
  if (!historyList) return;

  if (state.history.length === 0) {
    historyList.innerHTML = `
      <div class="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-xl">
        <span class="material-symbols-outlined text-[36px] mb-2 text-outline">history</span>
        <p class="font-bold text-on-surface">No generation history yet</p>
        <p class="text-body-sm">Your recent emails and grammar checks will appear here.</p>
      </div>
    `;
    return;
  }

  historyList.innerHTML = state.history.slice(0, 10).map((item, idx) => `
    <div class="p-4 rounded-xl border border-surface-container bg-surface-container-lowest flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full ${item.type === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[20px]">${item.type === 'email' ? 'mail' : 'spellcheck'}</span>
        </div>
        <div>
          <h4 class="font-bold text-on-surface text-body-md">${escapeHtml(item.subject || item.summary || 'Activity Item')}</h4>
          <p class="text-body-sm text-on-surface-variant">${new Date(item.timestamp).toLocaleString()} • ${item.type.toUpperCase()}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button class="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Copy Content" onclick="copyHistoryContent(${idx})">
          <span class="material-symbols-outlined text-[20px]">content_copy</span>
        </button>
        <button class="p-2 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete" onclick="deleteHistoryItem(${idx})">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

async function saveHistoryItem(item) {
  state.history.unshift(item);
  if (state.history.length > 50) state.history.pop();
  localStorage.setItem('gf_history', JSON.stringify(state.history));
  renderDashboard();

  // Save to isolated Firestore user document
  if (state.currentUser && typeof saveUserDataToFirestore === 'function') {
    await saveUserDataToFirestore(state.currentUser.uid, { history: state.history });
  }
}

function copyHistoryContent(idx) {
  const item = state.history[idx];
  if (!item) return;
  const content = item.content || item.corrected || item.subject;
  navigator.clipboard.writeText(content);
  showToast('History item copied to clipboard!', 'success');
}

async function deleteHistoryItem(idx) {
  state.history.splice(idx, 1);
  localStorage.setItem('gf_history', JSON.stringify(state.history));
  renderDashboard();
  showToast('Deleted item from history.', 'info');

  // Sync deletion to isolated Firestore user document
  if (state.currentUser && typeof saveUserDataToFirestore === 'function') {
    await saveUserDataToFirestore(state.currentUser.uid, { history: state.history });
  }
}

/* =====================================================
   FIREBASE AUTHENTICATION & DATA ISOLATION ENGINE
   ===================================================== */
function initAuthUI() {
  const authModalOverlay = document.getElementById('auth-modal-overlay');
  const btnCloseAuth = document.getElementById('btn-close-auth-modal');
  const btnSignOut = document.getElementById('btn-sign-out');

  // Modal Auth Elements
  const tabSignIn = document.getElementById('tab-btn-signin');
  const tabSignUp = document.getElementById('tab-btn-signup');
  const formSignIn = document.getElementById('form-signin');
  const formSignUp = document.getElementById('form-signup');
  const authErrorMsg = document.getElementById('auth-error-msg');
  const authErrorText = document.getElementById('auth-error-text');
  const btnGoogleAuth = document.getElementById('btn-google-auth');

  // Hero Landing Auth Elements
  const heroTabSignIn = document.getElementById('hero-tab-signin');
  const heroTabSignUp = document.getElementById('hero-tab-signup');
  const heroFormSignIn = document.getElementById('hero-form-signin');
  const heroFormSignUp = document.getElementById('hero-form-signup');
  const heroAuthErrorMsg = document.getElementById('hero-auth-error-msg');
  const heroAuthErrorText = document.getElementById('hero-auth-error-text');
  const heroBtnGoogleAuth = document.getElementById('hero-btn-google-auth');

  const landingAuthCard = document.getElementById('landing-auth-card');
  const landingUserCard = document.getElementById('landing-user-card');
  const landingUserWelcome = document.getElementById('landing-user-welcome');
  const landingUserEmail = document.getElementById('landing-user-email');

  function showAuthError(msg) {
    if (authErrorMsg && authErrorText) {
      authErrorText.innerText = msg;
      authErrorMsg.classList.remove('hidden');
    }
    if (heroAuthErrorMsg && heroAuthErrorText) {
      heroAuthErrorText.innerText = msg;
      heroAuthErrorMsg.classList.remove('hidden');
    }
  }

  function hideAuthError() {
    if (authErrorMsg) authErrorMsg.classList.add('hidden');
    if (heroAuthErrorMsg) heroAuthErrorMsg.classList.add('hidden');
  }

  function openAuthModal() {
    hideAuthError();
    if (authModalOverlay) authModalOverlay.classList.remove('hidden');
  }

  function closeAuthModal() {
    if (authModalOverlay) authModalOverlay.classList.add('hidden');
  }

  if (btnCloseAuth) btnCloseAuth.addEventListener('click', closeAuthModal);

  // Tab switching for Modal
  if (tabSignIn && tabSignUp) {
    tabSignIn.addEventListener('click', () => {
      hideAuthError();
      tabSignIn.className = 'flex-1 py-2.5 rounded-xl text-xs font-bold text-primary bg-surface-lowest shadow-sm transition-all flex items-center justify-center gap-1.5';
      tabSignUp.className = 'flex-1 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1.5';
      formSignIn.classList.remove('hidden');
      formSignUp.classList.add('hidden');
    });

    tabSignUp.addEventListener('click', () => {
      hideAuthError();
      tabSignUp.className = 'flex-1 py-2.5 rounded-xl text-xs font-bold text-primary bg-surface-lowest shadow-sm transition-all flex items-center justify-center gap-1.5';
      tabSignIn.className = 'flex-1 py-2.5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1.5';
      formSignUp.classList.remove('hidden');
      formSignIn.classList.add('hidden');
    });
  }

  // Tab switching for Hero Card
  if (heroTabSignIn && heroTabSignUp) {
    heroTabSignIn.addEventListener('click', () => {
      hideAuthError();
      heroTabSignIn.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-primary bg-surface-lowest shadow-sm transition-all flex items-center justify-center gap-1';
      heroTabSignUp.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1';
      heroFormSignIn.classList.remove('hidden');
      heroFormSignUp.classList.add('hidden');
    });

    heroTabSignUp.addEventListener('click', () => {
      hideAuthError();
      heroTabSignUp.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-primary bg-surface-lowest shadow-sm transition-all flex items-center justify-center gap-1';
      heroTabSignIn.className = 'flex-1 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1';
      heroFormSignUp.classList.remove('hidden');
      heroFormSignIn.classList.add('hidden');
    });
  }

  // Generic Sign In Handler
  async function handleSignIn(email, password, submitBtn) {
    hideAuthError();
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Signing in...';
      }
      await signInWithEmail(email, password);
      showToast('Signed in successfully!', 'success');
      closeAuthModal();
    } catch (err) {
      let msg = err.message || 'Failed to sign in.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please check your credentials or create an account.';
      }
      showAuthError(msg);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">lock_open</span> Sign In to Workspace';
      }
    }
  }

  // Generic Sign Up Handler
  async function handleSignUp(email, password, name, submitBtn) {
    hideAuthError();
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">sync</span> Creating Account...';
      }
      await signUpWithEmail(email, password, name);
      showToast('Account created successfully!', 'success');
      closeAuthModal();
    } catch (err) {
      let msg = err.message || 'Failed to create account.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please click Sign In.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters long.';
      }
      showAuthError(msg);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">person_add</span> Create Free Account';
      }
    }
  }

  // Generic Google Sign In Handler
  async function handleGoogleSignIn() {
    hideAuthError();
    try {
      await signInWithGoogle();
      showToast('Google sign in successful!', 'success');
      closeAuthModal();
    } catch (err) {
      showAuthError(err.message || 'Google sign-in popup was closed or cancelled.');
    }
  }

  // Form submit listeners for Modal
  if (formSignIn) {
    formSignIn.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value;
      handleSignIn(email, password, document.getElementById('btn-submit-signin'));
    });
  }

  if (formSignUp) {
    formSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;
      handleSignUp(email, password, name, document.getElementById('btn-submit-signup'));
    });
  }

  if (btnGoogleAuth) btnGoogleAuth.addEventListener('click', handleGoogleSignIn);

  // Form submit listeners for Hero Card
  if (heroFormSignIn) {
    heroFormSignIn.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('hero-signin-email').value.trim();
      const password = document.getElementById('hero-signin-password').value;
      handleSignIn(email, password, document.getElementById('hero-btn-submit-signin'));
    });
  }

  if (heroFormSignUp) {
    heroFormSignUp.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('hero-signup-name').value.trim();
      const email = document.getElementById('hero-signup-email').value.trim();
      const password = document.getElementById('hero-signup-password').value;
      handleSignUp(email, password, name, document.getElementById('hero-btn-submit-signup'));
    });
  }

  if (heroBtnGoogleAuth) heroBtnGoogleAuth.addEventListener('click', handleGoogleSignIn);

  // Sign Out
  if (btnSignOut) {
    btnSignOut.addEventListener('click', async () => {
      try {
        await signOutUser();
        showToast('Signed out successfully.', 'info');
      } catch (err) {
        showToast('Error signing out.', 'error');
      }
    });
  }

  // Firebase Auth State Observer
  if (typeof onAuthChange === 'function') {
    onAuthChange(async (user) => {
      const userBar = document.getElementById('user-profile-bar');
      const userEmailEl = document.getElementById('user-display-email');
      const userAvatarEl = document.getElementById('user-avatar-circle');

      if (user) {
        state.currentUser = user;
        if (userBar) userBar.classList.remove('hidden');
        if (authModalOverlay) authModalOverlay.classList.add('hidden');

        // Hero Cards state switch
        if (landingAuthCard) landingAuthCard.classList.add('hidden');
        if (landingUserCard) landingUserCard.classList.remove('hidden');

        const nameOrEmail = user.displayName || user.email || 'User';
        if (userEmailEl) userEmailEl.innerText = nameOrEmail;
        if (userAvatarEl) userAvatarEl.innerText = (nameOrEmail[0] || 'U').toUpperCase();
        if (landingUserWelcome) landingUserWelcome.innerText = `Welcome Back, ${user.displayName || nameOrEmail.split('@')[0]}!`;
        if (landingUserEmail) landingUserEmail.innerText = user.email || '';

        // Load isolated user history from Firestore
        if (typeof getUserDataFromFirestore === 'function') {
          const cloudData = await getUserDataFromFirestore(user.uid);
          if (cloudData && Array.isArray(cloudData.history)) {
            state.history = cloudData.history;
          } else {
            state.history = [];
          }
        }
        renderDashboard();

      } else {
        state.currentUser = null;
        if (userBar) userBar.classList.add('hidden');

        // Hero Cards state switch
        if (landingAuthCard) landingAuthCard.classList.remove('hidden');
        if (landingUserCard) landingUserCard.classList.add('hidden');

        state.history = [];
        renderDashboard();
      }
    });
  }
}

/* Toast Notifications */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const bg = type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white';
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';

  const toast = document.createElement('div');
  toast.className = `toast px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-semibold text-body-sm ${bg}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${icon}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.2s ease-out';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* LANDING PAGE INTERACTIVITY */
function initLandingPageView() {
  // 1. FAQ Accordion Toggle
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const toggleBtn = item.querySelector('.faq-toggle');
    const answer = item.querySelector('.faq-answer');
    if (toggleBtn && answer) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all other items for clean accordion behavior
        faqItems.forEach(other => {
          other.classList.remove('open');
          const otherAns = other.querySelector('.faq-answer');
          if (otherAns) otherAns.classList.add('hidden');
        });
        if (!isOpen) {
          item.classList.add('open');
          answer.classList.remove('hidden');
        }
      });
    }
  });

  // 2. Interactive Sandbox Preview Tab Switcher
  const btnEmailTab = document.getElementById('sandbox-tab-email');
  const btnGrammarTab = document.getElementById('sandbox-tab-grammar');
  const contentEmail = document.getElementById('sandbox-content-email');
  const contentGrammar = document.getElementById('sandbox-content-grammar');

  if (btnEmailTab && btnGrammarTab && contentEmail && contentGrammar) {
    btnEmailTab.addEventListener('click', () => {
      btnEmailTab.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-surface-lowest shadow-xs flex items-center gap-1.5';
      btnGrammarTab.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5';
      contentEmail.classList.remove('hidden');
      contentGrammar.classList.add('hidden');
    });

    btnGrammarTab.addEventListener('click', () => {
      btnGrammarTab.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-surface-lowest shadow-xs flex items-center gap-1.5';
      btnEmailTab.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface flex items-center gap-1.5';
      contentGrammar.classList.remove('hidden');
      contentEmail.classList.add('hidden');
    });
  }

  // 3. Interactive Sandbox Presets
  const presetData = {
    interview: {
      topic: 'Follow up after Software Engineer interview',
      recipient: 'Hiring Manager (Tech Lead)',
      tone: 'Confident',
      output: `Subject: Thank You for the Senior Developer Interview\n\nDear Hiring Manager,\n\nThank you for taking the time to discuss the Senior Engineer role with me yesterday. I really enjoyed learning more about your team's upcoming architecture migration.\n\nWith my 5 years of full-stack engineering experience, I am confident I can make an immediate contribution to your sprint goals. Please let me know if you need any additional code samples or references.\n\nBest regards,\nHasher Khan`
    },
    sales: {
      topic: 'Introduce AI Productivity SaaS Platform',
      recipient: 'VP of Marketing',
      tone: 'Persuasive',
      output: `Subject: Boost Your Marketing Team's Email Productivity by 40%\n\nDear VP of Marketing,\n\nI hope this email finds you well. I am reaching out to introduce fasterway.ai, an AI assistant designed to streamline high-impact business communication.\n\nOur platform automates email drafting and real-time grammar audits while guaranteeing zero factual hallucinations. Would you be open to a 10-minute demo next Tuesday at 10 AM?\n\nBest regards,\nHasher Khan`
    },
    extension: {
      topic: 'Request a 3-day assignment extension',
      recipient: 'Course Professor',
      tone: 'Formal',
      output: `Subject: Request for Assignment Extension - CS 101\n\nDear Professor,\n\nI am writing to respectfully request a 3-day extension for the Research Paper assignment originally due this Friday. Due to a brief illness earlier this week, I require extra time to complete my work to full academic standards.\n\nI can provide a medical note if necessary and commit to submitting the final paper by Monday at 5 PM. Thank you for your consideration.\n\nRespectfully,\nHasher Khan`
    }
  };

  const presetBtns = document.querySelectorAll('.sandbox-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => {
        b.className = 'sandbox-preset-btn px-3 py-1 bg-surface-container text-on-surface-variant hover:bg-surface-container-high rounded-lg text-xs font-semibold';
      });
      btn.className = 'sandbox-preset-btn active px-3 py-1 bg-primary text-on-primary rounded-lg text-xs font-semibold';

      const key = btn.dataset.preset;
      const data = presetData[key];
      if (data) {
        document.getElementById('sandbox-input-topic').textContent = data.topic;
        document.getElementById('sandbox-input-recipient').textContent = data.recipient;
        document.getElementById('sandbox-input-tone').textContent = data.tone;
        document.getElementById('sandbox-output-text').textContent = data.output;
      }
    });
  });

  // 4. Quick-Use Template Buttons on Landing Page
  const quickTemplateBtns = document.querySelectorAll('.quick-use-template-btn');
  quickTemplateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const t = TEMPLATES_DATABASE.find(item => item.id === templateId);
      if (t) {
        switchView('email-generator');
        const purposeInput = document.getElementById('email-purpose');
        const audienceInput = document.getElementById('email-audience');
        const toneSelect = document.getElementById('email-tone-select');
        const promptTextarea = document.getElementById('email-custom-prompt');

        if (purposeInput) purposeInput.value = t.purpose || '';
        if (audienceInput) audienceInput.value = t.audience || '';
        if (toneSelect) toneSelect.value = t.tone || 'professional';
        if (promptTextarea) promptTextarea.value = t.customPrompt || '';

        // Select tone pill if matched
        const tonePills = document.querySelectorAll('.tone-pill');
        tonePills.forEach(pill => {
          if (pill.dataset.tone === t.tone) {
            pill.className = 'tone-pill bg-primary text-on-primary border-primary';
          } else {
            pill.className = 'tone-pill bg-surface-container-low text-on-surface-variant hover:bg-surface-container';
          }
        });

        showToast(`Loaded "${t.title}" template into Email Generator!`, 'success');
      }
    });
  });
}

/* =====================================================
   SETTINGS ENGINE
   ===================================================== */
function initSettingsModal() {
  const modal = document.getElementById('settings-modal');
  const btnOpenDesktop = document.getElementById('btn-open-settings');
  const btnOpenMobile = document.getElementById('btn-open-settings-mobile');
  const btnClose = document.getElementById('btn-close-settings');
  const btnSave = document.getElementById('btn-save-settings');


  function openModal() {
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  }

  if (btnOpenDesktop) btnOpenDesktop.addEventListener('click', openModal);
  if (btnOpenMobile) btnOpenMobile.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnSave) btnSave.addEventListener('click', closeModal);

}
