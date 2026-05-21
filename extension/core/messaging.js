/**
 * Internet Control Panel — Messaging
 * Handles cross-context messaging between popup, background, and content scripts.
 * Sets globalThis.ICPMessaging.
 */

'use strict';

globalThis.ICPMessaging = (() => {
  const SUPPORTED_TYPES = Object.freeze([
    'ICP_TOGGLE_OVERLAY',
    'ICP_GET_STATUS',
    'ICP_CAPTURE_PAGE',
    'ICP_SHOW_DIAGNOSTICS',
  ]);

  /**
   * Send a message to the runtime (background or other extension contexts).
   * Fails gracefully if the runtime is unavailable.
   * @param {object} message
   * @returns {Promise<object>}
   */
  async function sendToRuntime(message) {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      return { ok: false, message: 'Chrome runtime not available.' };
    }
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, message: chrome.runtime.lastError.message });
          } else {
            resolve(response || { ok: false, message: 'No response from runtime.' });
          }
        });
      } catch (e) {
        resolve({ ok: false, message: String(e) });
      }
    });
  }

  /**
   * Send a message to a specific tab's content script.
   * @param {number} tabId
   * @param {object} message
   * @returns {Promise<object>}
   */
  async function sendToTab(tabId, message) {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      return { ok: false, message: 'chrome.tabs not available.' };
    }
    return new Promise((resolve) => {
      try {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, message: chrome.runtime.lastError.message });
          } else {
            resolve(response || { ok: false, message: 'No response from content script.' });
          }
        });
      } catch (e) {
        resolve({ ok: false, message: String(e) });
      }
    });
  }

  /**
   * Check if a message type is supported.
   * @param {string} type
   * @returns {boolean}
   */
  function isSupported(type) {
    return SUPPORTED_TYPES.includes(type);
  }

  return Object.freeze({ sendToRuntime, sendToTab, isSupported, SUPPORTED_TYPES });
})();
