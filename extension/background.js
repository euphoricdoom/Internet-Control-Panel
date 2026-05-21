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
      sendResponse({
        ok: true,
        settings: result.icpSettings || ICP_DEFAULT_SETTINGS,
        version: chrome.runtime.getManifest().version,
      });
    });
    return true; // keep channel open for async sendResponse
  }

  if (type === 'ICP_TOGGLE_OVERLAY') {
    // Forward to the active tab content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ ok: false, message: 'No active tab found.' });
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { type: 'ICP_TOGGLE_OVERLAY' }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ ok: false, message: chrome.runtime.lastError.message });
        } else {
          sendResponse(response || { ok: true });
        }
      });
    });
    return true;
  }

  // Unknown message — respond gracefully
  sendResponse({ ok: false, message: `Unknown message type: ${type}` });
  return false;
});
