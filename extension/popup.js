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

function normalizeResponse(response, fallbackMessage) {
  if (!response || typeof response !== 'object') {
    return { ok: false, message: fallbackMessage || 'No response.', data: null };
  }
  if (typeof response.ok === 'boolean') {
    return {
      ok: response.ok,
      message: response.message || (response.ok ? 'Done.' : 'Request failed.'),
      data: response.data || null,
      error: response.error || null,
    };
  }
  return { ok: true, message: fallbackMessage || 'Done.', data: response };
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
        resolve({
          ok: false,
          message: chrome.runtime.lastError.message || noContentMsg(),
          data: null,
          error: chrome.runtime.lastError.message || null,
        });
      } else {
        resolve(normalizeResponse(response, 'Content response received.'));
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
  if (!status.ok) {
    setStatus(noContentMsg(), false);
  } else {
    const data = status.data || {};
    setStatus(
      `URL: ${(data.url || tab.url || '').slice(0, 60)}…\nOverlay: ${data.overlayVisible ? 'visible' : 'hidden'} | Read mode: ${data.readModeActive ? 'on' : 'off'}`,
      false,
    );
  }
})();

// ── Toggle overlay ────────────────────────────────────────────────────────────
document.getElementById('icp-toggle-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_TOGGLE_OVERLAY' });
  if (!result.ok) { setStatus(noContentMsg(), false); return; }
  const visible = !!(result.data && result.data.overlayVisible);
  setStatus(`Overlay is now ${visible ? 'visible' : 'hidden'}.`, false);
});

// ── Capture page ──────────────────────────────────────────────────────────────
document.getElementById('icp-capture-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_CAPTURE_PAGE' });
  if (!result.ok) { setStatus(result.message || noContentMsg(), true); return; }
  setStatus(result.message || (result.ok ? 'Captured.' : 'Capture failed.'), !result.ok);
});

// ── Diagnostics ───────────────────────────────────────────────────────────────
document.getElementById('icp-diag-btn').addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { setStatus(noContentMsg(), true); return; }
  const result = await sendToContent(tab, { type: 'ICP_SHOW_DIAGNOSTICS' });
  if (!result.ok) { setStatus(result.message || noContentMsg(), true); return; }
  if (result.data) {
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
