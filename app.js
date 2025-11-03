/**
 * SentinelID UI Prototype — app.js
 * 
 * This file contains the core functionality for the SentinelID Identity Manager prototype.
 * Features implemented:
 * - Alias Management: Create and manage email aliases with groups
 * - Password Generator: Create strong random passwords
 * - Leak Detection: Simulate email breach checking
 * - Virtual Sessions: Demo of isolated browsing sessions
 * - Agentic Mode: AI-assisted security monitoring simulation
 */

(() => {
  /**
   * Utility Functions
   * ------------------------------------------------------------------------ */
  
  /** Enhanced DOM selector with error checking */
  const qs = (selector) => {
    const el = document.querySelector(selector);
    if (!el) console.warn(`Element not found: ${selector}`);
    return el;
  };

  /** Multiple element selector with Array conversion */
  const qsa = (selector) => Array.from(document.querySelectorAll(selector));

  /** Generate a random UID of specified length */
  const uid = (length = 6) => {
    const random = crypto && crypto.getRandomValues 
      ? () => crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff 
      : Math.random;
    return random().toString(36).slice(2, 2 + length);
  };

  /**
   * DOM Elements
   * ------------------------------------------------------------------------ */
  
  // Alias Manager Elements
  const aliasForm = qs('#alias-form');
  const aliasList = qs('#alias-list');
  const aliasName = qs('#alias-name');
  const aliasDomain = qs('#alias-domain');
  const aliasGroup = qs('#alias-group');
  const newAliasBtn = qs('#new-alias-btn');

  // Password Generator Elements
  const genBtn = qs('#gen-btn');
  const pwLen = qs('#pw-length');
  const pwLenVal = qs('#pw-length-value');
  const genOut = qs('#generated-pw');
  const copyPw = qs('#copy-pw');
  // Leak Detection Elements
  const realEmail = qs('#real-email');
  const checkEmailBtn = qs('#check-email');
  const leakResult = qs('#leak-result');

  // Virtual Sessions Elements
  const sessionAliasSelect = qs('#session-alias');
  const createSessionBtn = qs('#create-session');
  const sessionSite = qs('#session-site');
  const sessionList = qs('#session-list');

  // Agentic Mode Elements
  const agenticToggle = qs('#agentic-toggle');
  const agenticLog = qs('#agentic-log');

  // Modal Elements
  const modal = qs('#modal');
  const modalClose = qs('#modal-close');
  const modalBody = qs('#modal-body');

  /**
   * Application State Management
   * ------------------------------------------------------------------------ */
  
  const STORAGE_KEY = 'sentinelid.demo';
  const defaultState = {
    aliases: [],
    sessions: []
  };

  /** Current application state, initialized from localStorage or defaults */
  let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaultState;

  /** Persist current state to localStorage */
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  /**
   * Password Generation
   * ------------------------------------------------------------------------ */
  
  /** Generate a cryptographically strong password */
  function generatePassword(length = 16) {
    const charset = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      symbols: '!@#$%^&*()-_=+[]{}<>?~'
    };
    
    // Combine all character sets
    const chars = Object.values(charset).join('');
    
    // Use crypto.getRandomValues when available, fallback to Math.random
    const getRandomValue = crypto && crypto.getRandomValues 
      ? () => crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff 
      : Math.random;
    
    let password = '';
    while (password.length < length) {
      password += chars[Math.floor(getRandomValue() * chars.length)];
    }
    
    return password;
  }

  /**
   * Alias Management
   * ------------------------------------------------------------------------ */
  
  /** Create a new alias with generated password */
  function makeAlias(name, domain, group) {
    const local = `${name}@${domain}`;
    return {
      id: uid(8),
      name,
      local,
      domain,
      group,
      created: Date.now(),
      password: generatePassword(16)
    };
  }

  /** Render the alias list and update session selector */
  function renderAliases() {
    // Clear existing lists
    aliasList.innerHTML = '';
    sessionAliasSelect.innerHTML = '<option value="">(none)</option>';

    // Render each alias
    state.aliases.forEach(alias => {
      // Create alias list item
      const aliasElement = document.createElement('div');
      aliasElement.className = 'alias-item';
      aliasElement.innerHTML = `
        <div class="alias-meta">
          <strong>${alias.local}</strong>
          <span class="muted">${alias.group}</span>
        </div>
        <div class="alias-actions">
          <button class="btn small" data-id="${alias.id}" data-action="view">View</button>
          <button class="btn small" data-id="${alias.id}" data-action="copy">Copy</button>
        </div>
      `;
      aliasList.appendChild(aliasElement);

      // Add to session selector
      const option = document.createElement('option');
      option.value = alias.id;
      option.textContent = alias.local;
      sessionAliasSelect.appendChild(option);
    });
  }

  /**
   * Virtual Sessions Management
   * ------------------------------------------------------------------------ */
  
  /** Render the active sessions list */
  function renderSessions() {
    sessionList.innerHTML = '';
    
    state.sessions.forEach(session => {
      const sessionElement = document.createElement('div');
      sessionElement.className = 'session-item';
      sessionElement.innerHTML = `
        <div>
          <strong>${session.site}</strong>
          <div class="muted small">alias: ${session.aliasLocal}</div>
        </div>
        <div>
          <button class="btn" data-id="${session.id}" data-action="open">Open</button>
          <button class="btn" data-id="${session.id}" data-action="destroy">Destroy</button>
        </div>
      `;
      sessionList.appendChild(sessionElement);
    });
  }

  /**
   * Event Handlers
   * ------------------------------------------------------------------------ */
  
  /** Handle alias form submission */
  aliasForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Create new alias with fallback values
    const alias = makeAlias(
      aliasName.value.trim() || 'user',
      aliasDomain.value.trim() || 'example.com',
      aliasGroup.value
    );
    
    // Add to state and update UI
    state.aliases.unshift(alias);
    save();
    renderAliases();
    aliasForm.reset();
  });

  /** Handle alias list button clicks */
  aliasList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { id, action } = btn.dataset;
    const alias = state.aliases.find(a => a.id === id);
    
    switch (action) {
      case 'view':
        showModal(`
          <p><strong>${alias.local}</strong></p>
          <p>Group: ${alias.group}</p>
          <p>Password: <code>${alias.password}</code></p>
        `);
        break;
      case 'copy':
        if (navigator.clipboard) {
          navigator.clipboard.writeText(alias.local);
          flash(`${alias.local} copied`);
        }
        break;
    }
  });

  /** Password Generator Events */
  genBtn.addEventListener('click', () => {
    genOut.value = generatePassword(+pwLen.value);
  });

  pwLen.addEventListener('input', () => {
    pwLenVal.textContent = pwLen.value;
  });

  copyPw.addEventListener('click', () => {
    if (genOut.value && navigator.clipboard) {
      navigator.clipboard.writeText(genOut.value)
        .then(() => flash('Password copied'));
    }
  });

  /** Leak Detection Events */
  checkEmailBtn.addEventListener('click', () => {
    const email = realEmail.value.trim();
    if (!email) {
      return flash('Enter an email to check');
    }

    // Simulate async breach check
    leakResult.textContent = 'Checking…';
    setTimeout(() => {
      // Demo: Show breach if email contains 'breach' or ~18% random chance
      const found = email.includes('breach') || Math.random() < 0.18;
      leakResult.textContent = found 
        ? `⚠️ ${email} appears in a public breach.`
        : `✅ No public breach found for ${email}.`;
    }, 800);
  });

  /** Virtual Session Events */
  createSessionBtn.addEventListener('click', () => {
    const site = sessionSite.value.trim();
    const aliasId = sessionAliasSelect.value;
    
    if (!site) {
      return flash('Enter a site to create a session');
    }

    // Find selected alias or use ephemeral
    const alias = state.aliases.find(a => a.id === aliasId) || { local: '(ephemeral)' };
    
    // Create new session
    const session = {
      id: uid(8),
      site,
      aliasId,
      aliasLocal: alias.local || '(ephemeral)',
      created: Date.now()
    };

    state.sessions.unshift(session);
    save();
    renderSessions();
    flash('Session created');
  });

  sessionList.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { id, action } = btn.dataset;
    
    switch (action) {
      case 'destroy':
        state.sessions = state.sessions.filter(s => s.id !== id);
        save();
        renderSessions();
        flash('Session destroyed');
        break;
      case 'open':
        flash('Opening virtual tab (demo)');
        break;
    }
  });

  /** Agentic Mode Events */
  agenticToggle.addEventListener('change', () => {
    agenticLog.textContent = agenticToggle.checked
      ? 'Agentic Mode: ON — monitoring for risky requests.'
      : 'Agentic Mode: OFF';
  });

  /**
   * UI Components
   * ------------------------------------------------------------------------ */
  
  /** Modal Management */
  function showModal(html) {
    modal.setAttribute('aria-hidden', 'false');
    modalBody.innerHTML = html;
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modalBody.innerHTML = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  /** Toast Notification */
  function flash(message, duration = 2200) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 20);
    
    // Animate out and cleanup
    setTimeout(() => toast.classList.remove('show'), duration - 300);
    setTimeout(() => toast.remove(), duration);
  }

  /**
   * Application Initialization
   * ------------------------------------------------------------------------ */
  
  /** Initialize the application */
  function init() {
    // Render initial state
    renderAliases();
    renderSessions();

    // Set initial password length display
    pwLenVal.textContent = pwLen.value;

    // Generate initial password
    genOut.value = generatePassword(+pwLen.value);

    // Set initial agentic mode state
    agenticLog.textContent = agenticToggle.checked
      ? 'Agentic Mode: ON — monitoring for risky requests.'
      : 'Agentic Mode: OFF';
  }

  // Initialize on load
  init();

  /**
   * Debug Interface
   * ------------------------------------------------------------------------ */
  
  // Expose API for debugging and extension
  window.SentinelID = {
    // State management
    state,
    save,
    
    // Core functionality
    generatePassword,
    makeAlias,
    
    // UI utilities
    showModal,
    flash,
    
    // Version info
    version: '0.1.0',
    
    // Feature flags (for future use)
    features: {
      cryptoAvailable: Boolean(crypto && crypto.getRandomValues),
      clipboardAvailable: Boolean(navigator.clipboard),
      storageAvailable: Boolean(localStorage)
    }
  };
})();
