/**
 * Internet Control Panel — Popup Script
 */

'use strict';

const statusEl = document.getElementById('icp-status');

function setStatus(msg, isError) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#ff8080' : '#80d080';
}

function noContentMsg() {
  return 'Content runtime not available on this page. Try refreshing or opening a normal webpage.';
}

async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs && tabs.length > 0 ? tabs[0] : null);
    });
  });
}

async function sendToContent(tab, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
(async () => {
  const tab = await getActiveTab();
  if (!tab) {
    setStatus('No active tab found.', true);
    return;
  }

  // Get status from content script
  const status = await sendToContent(tab, { type: 'ICP_GET_STATUS' });
  if (!status) {
    setStatus(noContentMsg(), false);
  } else {
    setStatus(
      `URL: ${(status.url || tab.url || '').slice(0, 60)}…\nOverlay: ${status.overlayVisible ? 'visible' : 'hidden'} | Read mode: ${status.readModeActive ? 'on' : 'off'}`,
      false,
    );
  }
})();

// ── Toggle overlay ────────────────────────────────────────────────────────────
document.getElementById('icp-toggle-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_TOGGLE_OVERLAY' });
  if (!result) { setStatus(noContentMsg(), false); return; }
  setStatus(`Overlay is now ${result.visible ? 'visible' : 'hidden'}.`, false);
});

// ── Capture page ──────────────────────────────────────────────────────────────
document.getElementById('icp-capture-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_CAPTURE_PAGE' });
  if (!result) { setStatus(noContentMsg(), false); return; }
  setStatus(result.message || (result.ok ? 'Captured.' : 'Capture failed.'), !result.ok);
});

// ── Diagnostics ───────────────────────────────────────────────────────────────
document.getElementById('icp-diag-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_SHOW_DIAGNOSTICS' });
  if (!result) { setStatus(noContentMsg(), false); return; }
  if (result.ok && result.data) {
    const d = result.data;
    setStatus(
      `Links: ${d.linkCount}  Images: ${d.imageCount}  Scripts: ${d.scriptCount}\nForms: ${d.formCount}  Words: ${d.wordCount}\nState: ${d.readyState}`,
      false,
    );
  } else {
    setStatus(result.message || 'Diagnostics unavailable.', !result.ok);
  }
});

// ── Open options ──────────────────────────────────────────────────────────────
document.getElementById('icp-options-btn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
