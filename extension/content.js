/**
 * Internet Control Panel — Content Script
 * Injects a Shadow DOM overlay runtime into every page.
 * Uses globalThis.ICP_* modules loaded before this script.
 */

'use strict';

(function icpContentInit() {
  // Prevent double injection
  if (document.getElementById('icp-root')) return;

  // Wait for body
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', icpContentInit);
    return;
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let overlayVisible = true;
  let readModeActive = false;
  let originalBodyStyle = null;

  // ── Shadow DOM host ────────────────────────────────────────────────────────
  const host = document.createElement('div');
  host.id = 'icp-root';
  // Minimal host style — no global page impact
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 80px; right: 20px;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  // ── Inject overlay CSS into shadow root ────────────────────────────────────
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('overlay.css');
  shadow.appendChild(styleLink);

  // ── Build overlay HTML ─────────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = 'icp-panel';
  panel.innerHTML = `
    <div id="icp-header">
      <span id="icp-title">⚙ ICP</span>
      <span id="icp-adapter-label"></span>
      <button id="icp-collapse-btn" title="Collapse / Expand">▲</button>
    </div>
    <div id="icp-body">
      <div id="icp-btn-row">
        <button class="icp-btn" data-cmd="cleanPage">Clean Page</button>
        <button class="icp-btn" data-cmd="toggleReadMode">Read Mode</button>
        <button class="icp-btn" data-cmd="copyLinks">Copy Links</button>
        <button class="icp-btn" data-cmd="capturePage">Capture Page</button>
        <button class="icp-btn" data-cmd="showDiagnostics">Diagnostics</button>
        <button class="icp-btn icp-btn-warn" data-cmd="toggleOverlay">Hide Panel</button>
      </div>
      <div id="icp-cmd-row">
        <input id="icp-cmd-input" type="text" placeholder="Command… (help for list)" autocomplete="off" spellcheck="false" />
        <button id="icp-cmd-run">Run</button>
      </div>
      <div id="icp-output" aria-live="polite"></div>
    </div>
  `;
  shadow.appendChild(panel);

  // ── References ─────────────────────────────────────────────────────────────
  const header = shadow.getElementById('icp-header');
  const collapseBtn = shadow.getElementById('icp-collapse-btn');
  const body = shadow.getElementById('icp-body');
  const adapterLabel = shadow.getElementById('icp-adapter-label');
  const cmdInput = shadow.getElementById('icp-cmd-input');
  const cmdRunBtn = shadow.getElementById('icp-cmd-run');
  const output = shadow.getElementById('icp-output');

  // ── Output helper ──────────────────────────────────────────────────────────
  function showOutput(html, isError) {
    output.innerHTML = `<span class="${isError ? 'icp-error' : 'icp-ok'}">${html}</span>`;
  }

  function showResult(result) {
    if (!result) return;
    showOutput(
      result.message
        ? escapeHtml(result.message) + (result.data ? '<br><pre>' + escapeHtml(JSON.stringify(result.data, null, 2)) + '</pre>' : '')
        : '',
      !result.ok,
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Adapter label ──────────────────────────────────────────────────────────
  try {
    const adapter = globalThis.ICPAdapters && globalThis.ICPAdapters.detect();
    if (adapter && adapter.label) {
      adapterLabel.textContent = `[${adapter.label}]`;
    }
  } catch (_) {}

  // ── Command buttons ────────────────────────────────────────────────────────
  shadow.querySelectorAll('.icp-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const cmd = btn.dataset.cmd;
      try {
        const result = await runCommand(cmd);
        showResult(result);
      } catch (e) {
        showOutput(escapeHtml(String(e)), true);
      }
    });
  });

  // ── Command input ──────────────────────────────────────────────────────────
  async function handleCommandInput() {
    const raw = cmdInput.value.trim();
    if (!raw) return;
    cmdInput.value = '';
    try {
      const result = await runCommand(raw);
      showResult(result);
    } catch (e) {
      showOutput(escapeHtml(String(e)), true);
    }
  }

  cmdRunBtn.addEventListener('click', handleCommandInput);
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCommandInput();
  });

  // ── Run a command (alias or registered) ───────────────────────────────────
  async function runCommand(nameOrAlias) {
    if (globalThis.ICPCommands) {
      return await globalThis.ICPCommands.run(nameOrAlias, { shadow, output, showOutput });
    }
    return { ok: false, message: 'Command registry not available.' };
  }

  // ── Collapse / Expand ──────────────────────────────────────────────────────
  let collapsed = false;
  collapseBtn.addEventListener('click', () => {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : '';
    collapseBtn.textContent = collapsed ? '▼' : '▲';
  });

  // ── Drag by header ─────────────────────────────────────────────────────────
  let dragging = false;
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  header.addEventListener('mousedown', (e) => {
    if (e.target === collapseBtn) return;
    dragging = true;
    const rect = host.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const x = e.clientX - dragOffsetX;
    const y = e.clientY - dragOffsetY;
    host.style.left = `${Math.max(0, x)}px`;
    host.style.top = `${Math.max(0, y)}px`;
    host.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { dragging = false; });

  // ── Toggle overlay visibility ─────────────────────────────────────────────
  function setOverlayVisible(visible) {
    overlayVisible = visible;
    host.style.display = visible ? '' : 'none';
  }

  // ── Hotkey: Alt + Shift + I ───────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyI') {
      setOverlayVisible(!overlayVisible);
    }
  });

  // ── Page Clean ────────────────────────────────────────────────────────────
  function cleanPage() {
    const selectors = [
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[class*="banner"]',
      '[id*="banner"]',
      '[class*="newsletter"]',
      '[id*="newsletter"]',
      '[class*="popup"]',
      '[id*="popup"]',
      '[class*="modal-overlay"]',
      '[class*="gdpr"]',
      '[id*="gdpr"]',
      '[class*="consent"]',
      '[id*="consent"]',
      '[aria-label*="cookie" i]',
      '[aria-label*="consent" i]',
    ];
    let removed = 0;
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          // Skip the ICP host itself
          if (el === host || el.contains(host)) return;
          el.remove();
          removed++;
        });
      } catch (_) {}
    });
    return removed;
  }

  // ── Read Mode ─────────────────────────────────────────────────────────────
  function enableReadMode() {
    originalBodyStyle = document.body.getAttribute('style') || '';
    document.body.style.maxWidth = '740px';
    document.body.style.margin = '40px auto';
    document.body.style.padding = '0 24px';
    document.body.style.fontFamily = 'Georgia, "Times New Roman", serif';
    document.body.style.fontSize = '18px';
    document.body.style.lineHeight = '1.75';
    document.body.style.background = '#fafaf8';
    document.body.style.color = '#222';
    readModeActive = true;
  }

  function disableReadMode() {
    if (originalBodyStyle !== null) {
      document.body.setAttribute('style', originalBodyStyle);
    }
    readModeActive = false;
  }

  // ── Register commands using ICPCommands ───────────────────────────────────
  function registerCommands() {
    if (!globalThis.ICPCommands) return;
    const C = globalThis.ICPCommands;

    C.register('cleanPage', async () => {
      const count = cleanPage();
      return { ok: true, message: `Cleaned page. Removed ${count} element(s).` };
    }, { aliases: ['clean'], description: 'Remove common clutter (banners, cookie notices).' });

    C.register('toggleReadMode', async () => {
      if (readModeActive) {
        disableReadMode();
        return { ok: true, message: 'Read mode disabled.' };
      } else {
        enableReadMode();
        return { ok: true, message: 'Read mode enabled.' };
      }
    }, { aliases: ['read'], description: 'Toggle a clean reading layout.' });

    C.register('copyLinks', async () => {
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map(a => a.href)
        .filter(href => href.startsWith('http'));
      const unique = [...new Set(links)];
      if (unique.length === 0) return { ok: false, message: 'No links found.' };
      try {
        await navigator.clipboard.writeText(unique.join('\n'));
        return { ok: true, message: `Copied ${unique.length} link(s) to clipboard.` };
      } catch (e) {
        return { ok: false, message: 'Clipboard write failed: ' + String(e) };
      }
    }, { aliases: ['links'], description: 'Copy all page links to clipboard.' });

    C.register('capturePage', async () => {
      if (!globalThis.ICPLedger) return { ok: false, message: 'Ledger not available.' };
      const entry = globalThis.ICPLedger.createPageCapture();
      await globalThis.ICPLedger.savePageCapture(entry);
      return { ok: true, message: 'Page captured to ledger.', data: { id: entry.id, title: entry.title } };
    }, { aliases: ['capture'], description: 'Save current page to local ledger.' });

    C.register('showDiagnostics', async () => {
      if (!globalThis.ICPDiagnostics) return { ok: false, message: 'Diagnostics not available.' };
      const data = globalThis.ICPDiagnostics.collect();
      return { ok: true, message: 'Diagnostics collected.', data };
    }, { aliases: ['diag'], description: 'Show page diagnostics.' });

    C.register('toggleOverlay', async () => {
      setOverlayVisible(!overlayVisible);
      return { ok: true, message: overlayVisible ? 'Overlay shown.' : 'Overlay hidden. Use Alt+Shift+I to restore.' };
    }, { aliases: ['hide'], description: 'Toggle overlay visibility.' });

    C.register('help', async () => {
      const cmds = C.list();
      const lines = cmds.map(c => `${c.name}${c.aliases && c.aliases.length ? ' / ' + c.aliases.join(' / ') : ''} — ${c.description || ''}`);
      return { ok: true, message: lines.join('\n') };
    }, { aliases: [], description: 'List available commands.' });
  }

  registerCommands();

  // ── Messaging ─────────────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const type = message && message.type;
    if (type === 'ICP_TOGGLE_OVERLAY') {
      setOverlayVisible(!overlayVisible);
      sendResponse({ ok: true, visible: overlayVisible });
      return false;
    }
    if (type === 'ICP_GET_STATUS') {
      sendResponse({ ok: true, overlayVisible, readModeActive, url: location.href });
      return false;
    }
    if (type === 'ICP_CAPTURE_PAGE') {
      runCommand('capturePage').then(result => sendResponse(result));
      return true;
    }
    if (type === 'ICP_SHOW_DIAGNOSTICS') {
      runCommand('showDiagnostics').then(result => sendResponse(result));
      return true;
    }
  });

  console.log('[ICP] Content runtime initialized.');
})();
