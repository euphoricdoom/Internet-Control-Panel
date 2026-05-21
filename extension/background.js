/**
 * Internet Control Panel — Background Service Worker
 * Manifest V3 service worker. No external network calls.
 */

'use strict';

const ICP_DEFAULT_SETTINGS = {
  overlayEnabled: true,
  readModeDefault: false,
  capturePreviewLimit: 1200,
};

function ok(message, data) {
  return { ok: true, message, data: data || null };
}

function fail(message, error) {
  const payload = { ok: false, message };
  if (error) payload.error = String(error && error.message ? error.message : error);
  return payload;
}

// ── Install ──────────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ icpSettings: ICP_DEFAULT_SETTINGS });
    console.log('[ICP background] Extension installed. Default settings written.');
  } else if (details.reason === 'update') {
    // Merge new defaults without overwriting user settings
    const existing = await chrome.storage.local.get('icpSettings');
    const merged = Object.assign({}, ICP_DEFAULT_SETTINGS, existing.icpSettings || {});
    await chrome.storage.local.set({ icpSettings: merged });
    console.log('[ICP background] Extension updated. Settings merged.');
  }
});

// ── Message handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const type = message && message.type;

  if (type === 'ICP_GET_STATUS') {
    chrome.storage.local.get('icpSettings', (result) => {
      if (chrome.runtime.lastError) {
        sendResponse(fail('Failed to read settings.', chrome.runtime.lastError.message));
        return;
      }
      sendResponse(ok('Background status ready.', {
        settings: result.icpSettings || ICP_DEFAULT_SETTINGS,
        version: chrome.runtime.getManifest().version,
        senderTabId: sender && sender.tab ? sender.tab.id : null,
      }));
    });
    return true; // keep channel open for async sendResponse
  }

  if (type === 'ICP_TOGGLE_OVERLAY') {
    // Forward to the active tab content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse(fail('No active tab found.'));
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: 'ICP_TOGGLE_OVERLAY' }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse(fail('Failed to toggle overlay in content runtime.', chrome.runtime.lastError.message));
        } else {
          if (!response || typeof response !== 'object') {
            sendResponse(ok('Overlay toggle forwarded.', null));
            return;
          }
          if (typeof response.ok === 'boolean') {
            sendResponse(response);
            return;
          }
          sendResponse(ok('Overlay toggle forwarded.', response));
        }
      });
    });
    return true;
  }

  // Unknown message — respond gracefully
  sendResponse(fail(`Unknown message type: ${type || 'missing type'}`));
  return false;
});
