/**
 * Internet Control Panel — Content Script
 * Injects a Shadow DOM overlay runtime into every page.
 */

'use strict';

(function icpContentInit() {
  if (document.getElementById('icp-root')) return;

  if (!document.body) {
    document.addEventListener('DOMContentLoaded', icpContentInit, { once: true });
    return;
  }

  const constants = globalThis.ICP_CONSTANTS || {};
  const messageTypes = constants.MESSAGE_TYPES || {};

  let overlayVisible = true;
  let readModeActive = false;
  let originalBodyStyle = null;
  let collapsed = false;
  let adapter = { adapterId: 'generic', label: 'Generic' };

  const host = document.createElement('div');
  host.id = constants.ROOT_ID || 'icp-root';
  host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 80px; right: 20px;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });

  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('overlay.css');
  shadow.appendChild(styleLink);

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

  const header = shadow.getElementById('icp-header');
  const collapseBtn = shadow.getElementById('icp-collapse-btn');
  const body = shadow.getElementById('icp-body');
  const adapterLabel = shadow.getElementById('icp-adapter-label');
  const cmdInput = shadow.getElementById('icp-cmd-input');
  const cmdRunBtn = shadow.getElementById('icp-cmd-run');
  const output = shadow.getElementById('icp-output');

  function resultOk(message, data) {
    return { ok: true, message, data };
  }

  function resultFail(message, error) {
    const result = { ok: false, message };
    if (error) result.error = String(error && error.message ? error.message : error);
    return result;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

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

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function clampPosition(x, y) {
    const rect = host.getBoundingClientRect();
    const width = rect.width || 360;
    const height = rect.height || 220;
    return {
      x: clamp(Number.isFinite(x) ? x : window.innerWidth - width - 20, 0, Math.max(0, window.innerWidth - width)),
      y: clamp(Number.isFinite(y) ? y : 80, 0, Math.max(0, window.innerHeight - height)),
    };
  }

  async function saveOverlayState(partial) {
    if (!globalThis.ICPStorage || !globalThis.ICPStorage.setOverlayState) return;
    try {
      await globalThis.ICPStorage.setOverlayState(partial);
    } catch (e) {
      console.warn('[ICP] overlay state save failed:', e);
    }
  }

  function applyCollapsed(nextCollapsed, persist) {
    collapsed = !!nextCollapsed;
    body.style.display = collapsed ? 'none' : '';
    collapseBtn.textContent = collapsed ? '▼' : '▲';
    if (persist) saveOverlayState({ collapsed });
  }

  function setOverlayVisible(visible, persist = true) {
    overlayVisible = !!visible;
    host.style.display = overlayVisible ? '' : 'none';
    if (persist) saveOverlayState({ visible: overlayVisible });
  }

  function setHostPosition(x, y, persist) {
    const pos = clampPosition(x, y);
    host.style.left = `${pos.x}px`;
    host.style.top = `${pos.y}px`;
    host.style.right = 'auto';
    if (persist) saveOverlayState({ x: pos.x, y: pos.y });
  }

  async function restoreOverlayState() {
    if (!globalThis.ICPStorage || !globalThis.ICPStorage.getOverlayState) return;
    try {
      const state = await globalThis.ICPStorage.getOverlayState();
      applyCollapsed(!!state.collapsed, false);
      setOverlayVisible(state.visible !== false, false);
      if (Number.isFinite(state.x) && Number.isFinite(state.y)) {
        requestAnimationFrame(() => setHostPosition(state.x, state.y, false));
      }
    } catch (e) {
      console.warn('[ICP] overlay state restore failed:', e);
    }
  }

  async function applyInitialSettings() {
    if (!globalThis.ICPStorage || !globalThis.ICPStorage.getSettings) return;
    try {
      const settings = await globalThis.ICPStorage.getSettings();
      if (settings && settings.overlayEnabled === false) {
        setOverlayVisible(false, false);
      }
      if (settings && settings.readModeDefault === true) {
        enableReadMode();
      }
    } catch (e) {
      console.warn('[ICP] settings restore failed:', e);
    }
  }

  try {
    adapter = (globalThis.ICPAdapters && globalThis.ICPAdapters.detect()) || adapter;
    adapterLabel.textContent = `[${adapter.label || 'Generic'}]`;
    saveOverlayState({ lastAdapterLabel: adapter.label || 'Generic' });
  } catch (_) {}

  async function runCommand(nameOrAlias) {
    try {
      if (!globalThis.ICPCommands) return resultFail('Command registry not available.');
      const result = await globalThis.ICPCommands.run(nameOrAlias, { shadow, output, showOutput });
      return result && typeof result === 'object' ? result : resultOk(String(result || 'Done.'));
    } catch (e) {
      return resultFail(`Command failed: ${nameOrAlias}`, e);
    }
  }

  shadow.querySelectorAll('.icp-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const result = await runCommand(btn.dataset.cmd);
      showResult(result);
    });
  });

  async function handleCommandInput() {
    const raw = cmdInput.value.trim();
    if (!raw) return;
    cmdInput.value = '';
    const result = await runCommand(raw);
    showResult(result);
  }

  cmdRunBtn.addEventListener('click', handleCommandInput);
  cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleCommandInput();
  });

  collapseBtn.addEventListener('click', () => applyCollapsed(!collapsed, true));

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
    setHostPosition(e.clientX - dragOffsetX, e.clientY - dragOffsetY, false);
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    const rect = host.getBoundingClientRect();
    setHostPosition(rect.left, rect.top, true);
  });

  window.addEventListener('resize', () => {
    const rect = host.getBoundingClientRect();
    setHostPosition(rect.left, rect.top, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyI') {
      setOverlayVisible(!overlayVisible, true);
    }
  });

  function cleanPage() {
    const selectors = [
      '[class*="cookie"]', '[id*="cookie"]', '[class*="banner"]', '[id*="banner"]',
      '[class*="newsletter"]', '[id*="newsletter"]', '[class*="popup"]', '[id*="popup"]',
      '[class*="modal-overlay"]', '[class*="gdpr"]', '[id*="gdpr"]', '[class*="consent"]',
      '[id*="consent"]', '[aria-label*="cookie" i]', '[aria-label*="consent" i]',
    ];
    const protectedTags = new Set(['HTML', 'BODY', 'MAIN', 'ARTICLE', 'NAV', 'SCRIPT', 'STYLE', 'FORM', 'INPUT', 'TEXTAREA', 'BUTTON']);
    let removed = 0;
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => {
          if (el === host || el.contains(host) || protectedTags.has(el.tagName)) return;
          el.remove();
          removed++;
        });
      } catch (_) {}
    });
    return removed;
  }

  function enableReadMode() {
    if (!readModeActive) originalBodyStyle = document.body.getAttribute('style') || '';
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
    if (originalBodyStyle !== null) document.body.setAttribute('style', originalBodyStyle);
    readModeActive = false;
  }

  function registerCommands() {
    if (!globalThis.ICPCommands) return;
    const C = globalThis.ICPCommands;

    C.register('cleanPage', async () => resultOk(`Cleaned page. Removed ${cleanPage()} element(s).`), { aliases: ['clean'], description: 'Remove common clutter.' });

    C.register('toggleReadMode', async () => {
      if (readModeActive) {
        disableReadMode();
        return resultOk('Read mode disabled.');
      }
      enableReadMode();
      return resultOk('Read mode enabled.');
    }, { aliases: ['read'], description: 'Toggle reading layout.' });

    C.register('copyLinks', async () => {
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href).filter(href => href.startsWith('http'));
      const unique = [...new Set(links)];
      if (!unique.length) return resultFail('No links found.');
      try {
        await navigator.clipboard.writeText(unique.join('\n'));
        return resultOk(`Copied ${unique.length} link(s) to clipboard.`);
      } catch (e) {
        return resultFail('Clipboard write failed.', e);
      }
    }, { aliases: ['links'], description: 'Copy all page links.' });

    C.register('capturePage', async () => {
      if (!globalThis.ICPLedger) return resultFail('Ledger not available.');
      const entry = globalThis.ICPLedger.createPageCapture();
      await globalThis.ICPLedger.savePageCapture(entry);
      return resultOk('Page captured to ledger.', { id: entry.id, title: entry.title });
    }, { aliases: ['capture'], description: 'Save page to local ledger.' });

    C.register('showDiagnostics', async () => {
      if (!globalThis.ICPDiagnostics) return resultFail('Diagnostics not available.');
      return resultOk('Diagnostics collected.', globalThis.ICPDiagnostics.collect());
    }, { aliases: ['diag', 'diagnostics'], description: 'Show page diagnostics.' });

    C.register('toggleOverlay', async () => {
      setOverlayVisible(!overlayVisible, true);
      return resultOk(overlayVisible ? 'Overlay shown.' : 'Overlay hidden. Use Alt+Shift+I to restore.');
    }, { aliases: ['hide'], description: 'Toggle overlay visibility.' });

    C.register('status', async () => resultOk('Runtime status.', getStatusData()), { aliases: [], description: 'Show runtime status.' });

    C.register('help', async () => {
      const lines = C.list().map(c => `${c.name}${c.aliases && c.aliases.length ? ' / ' + c.aliases.join(' / ') : ''} — ${c.description || ''}`);
      return resultOk(lines.join('\n'));
    }, { aliases: [], description: 'List commands.' });
  }

  function getStatusData() {
    return {
      ready: true,
      overlayVisible,
      collapsed,
      readModeActive,
      url: location.href,
      title: document.title || '',
      adapterId: adapter.adapterId || 'generic',
      adapterLabel: adapter.label || 'Generic',
      version: constants.VERSION || chrome.runtime.getManifest().version,
    };
  }

  registerCommands();
  restoreOverlayState();
  applyInitialSettings();

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const type = message && message.type;
    const respond = (result) => sendResponse(result && typeof result === 'object' ? result : resultOk('Done.', result));

    if (type === (messageTypes.TOGGLE_OVERLAY || 'ICP_TOGGLE_OVERLAY')) {
      setOverlayVisible(!overlayVisible, true);
      respond(resultOk(overlayVisible ? 'Overlay shown.' : 'Overlay hidden.', getStatusData()));
      return false;
    }
    if (type === (messageTypes.GET_STATUS || 'ICP_GET_STATUS')) {
      respond(resultOk('Content runtime ready.', getStatusData()));
      return false;
    }
    if (type === (messageTypes.CAPTURE_PAGE || 'ICP_CAPTURE_PAGE')) {
      runCommand('capturePage').then(respond);
      return true;
    }
    if (type === (messageTypes.SHOW_DIAGNOSTICS || 'ICP_SHOW_DIAGNOSTICS')) {
      runCommand('showDiagnostics').then(respond);
      return true;
    }

    respond(resultFail(`Unsupported content message: ${type || 'missing type'}`));
    return false;
  });

  console.log('[ICP] Content runtime initialized.');
})();
