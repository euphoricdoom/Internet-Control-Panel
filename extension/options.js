/**
 * Internet Control Panel — Options Script
 */

'use strict';

const statusEl = document.getElementById('icp-status-msg');

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#ff8080' : '#80d080';
}

const DEFAULT_SETTINGS = {
  overlayEnabled: true,
  readModeDefault: false,
  capturePreviewLimit: 1200,
};

// ── Load settings ─────────────────────────────────────────────────────────────
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get('icpSettings', (result) => {
      resolve(Object.assign({}, DEFAULT_SETTINGS, result.icpSettings || {}));
    });
  });
}

// ── Save settings ─────────────────────────────────────────────────────────────
async function saveSettings(settings) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ icpSettings: settings }, resolve);
  });
}

// ── Populate form ─────────────────────────────────────────────────────────────
(async () => {
  const settings = await loadSettings();
  document.getElementById('icp-overlay-enabled').checked = !!settings.overlayEnabled;
  document.getElementById('icp-read-mode-default').checked = !!settings.readModeDefault;
  document.getElementById('icp-capture-limit').value = settings.capturePreviewLimit || 1200;
})();

// ── Save button ───────────────────────────────────────────────────────────────
document.getElementById('icp-save-btn').addEventListener('click', async () => {
  const settings = {
    overlayEnabled: document.getElementById('icp-overlay-enabled').checked,
    readModeDefault: document.getElementById('icp-read-mode-default').checked,
    capturePreviewLimit: parseInt(document.getElementById('icp-capture-limit').value, 10) || 1200,
  };
  await saveSettings(settings);
  setStatus('Settings saved.', false);
  setTimeout(() => { statusEl.textContent = ''; }, 2500);
});

// ── Export ledger ─────────────────────────────────────────────────────────────
document.getElementById('icp-export-btn').addEventListener('click', async () => {
  chrome.storage.local.get('icpLedger', (result) => {
    const entries = result.icpLedger || [];
    const json = JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icp-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus(`Exported ${entries.length} ledger entry/entries.`, false);
  });
});

// ── Clear ledger ──────────────────────────────────────────────────────────────
document.getElementById('icp-clear-btn').addEventListener('click', async () => {
  if (!confirm('Clear all ledger entries? This cannot be undone.')) return;
  chrome.storage.local.remove('icpLedger', () => {
    setStatus('Ledger cleared.', false);
    setTimeout(() => { statusEl.textContent = ''; }, 2500);
  });
});
