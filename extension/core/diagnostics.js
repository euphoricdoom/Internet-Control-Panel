/**
 * Internet Control Panel — Diagnostics
 * Collects safe, non-sensitive page metrics.
 * Sets globalThis.ICPDiagnostics.
 *
 * NOTE: Does NOT collect passwords, cookies, tokens, form field values,
 * localStorage contents, or personal data.
 */

'use strict';

globalThis.ICPDiagnostics = (() => {
  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  /**
   * Collect safe page metrics.
   * @returns {object}
   */
  function collect() {
    const bodyText = document.body ? (document.body.innerText || '') : '';
    return {
      url: location.href,
      title: document.title || '',
      readyState: document.readyState,
      linkCount: document.querySelectorAll('a[href]').length,
      imageCount: document.querySelectorAll('img').length,
      scriptCount: document.querySelectorAll('script').length,
      formCount: document.querySelectorAll('form').length,
      wordCount: countWords(bodyText),
      timestamp: new Date().toISOString(),
      extensionVersion:
        (globalThis.ICP_CONSTANTS && globalThis.ICP_CONSTANTS.VERSION) || '0.1.0',
    };
  }

  return Object.freeze({ collect });
})();
