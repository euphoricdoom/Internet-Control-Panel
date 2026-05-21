/**
 * Internet Control Panel — Ledger
 * Records local page capture entries.
 * Sets globalThis.ICPLedger.
 */

'use strict';

globalThis.ICPLedger = (() => {
  const LEDGER_KEY = () =>
    (globalThis.ICP_CONSTANTS && globalThis.ICP_CONSTANTS.STORAGE_KEYS.LEDGER) || 'icpLedger';

  const PREVIEW_LIMIT = 1200;

  function generateId() {
    return `icp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Build a page capture entry from the current document state.
   * @returns {object} ledger entry
   */
  function createPageCapture() {
    const bodyText = document.body ? (document.body.innerText || '') : '';
    const preview = bodyText.slice(0, PREVIEW_LIMIT).trim();

    return {
      id: generateId(),
      type: 'page_capture',
      url: location.href,
      title: document.title || '',
      capturedAt: new Date().toISOString(),
      textPreview: preview,
      linkCount: document.querySelectorAll('a[href]').length,
      imageCount: document.querySelectorAll('img').length,
      wordCount: countWords(bodyText),
    };
  }

  /**
   * Save a capture entry to the ledger.
   * @param {object} entry
   * @returns {Promise<void>}
   */
  async function savePageCapture(entry) {
    if (!globalThis.ICPStorage) return;
    await globalThis.ICPStorage.appendToList(LEDGER_KEY(), entry);
  }

  /**
   * Retrieve all ledger entries.
   * @returns {Promise<object[]>}
   */
  async function listCaptures() {
    if (!globalThis.ICPStorage) return [];
    return await globalThis.ICPStorage.get(LEDGER_KEY(), []);
  }

  /**
   * Export all ledger entries as a JSON string.
   * @returns {Promise<string>}
   */
  async function exportLedger() {
    const entries = await listCaptures();
    return JSON.stringify({ exportedAt: new Date().toISOString(), entries }, null, 2);
  }

  /**
   * Clear all ledger entries from storage.
   * @returns {Promise<void>}
   */
  async function clearLedger() {
    if (!globalThis.ICPStorage) return;
    await globalThis.ICPStorage.clearLedger();
  }

  return Object.freeze({
    createPageCapture,
    savePageCapture,
    listCaptures,
    exportLedger,
    clearLedger,
  });
})();
