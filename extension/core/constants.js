/**
 * Internet Control Panel — Constants
 * Loaded as a plain content script. No ES module imports.
 * Sets globalThis.ICP_CONSTANTS.
 */

'use strict';

globalThis.ICP_CONSTANTS = Object.freeze({
  VERSION: '0.1.0',

  ROOT_ID: 'icp-root',

  STORAGE_KEYS: Object.freeze({
    SETTINGS: 'icpSettings',
    LEDGER: 'icpLedger',
  }),

  COMMANDS: Object.freeze({
    CLEAN_PAGE: 'cleanPage',
    TOGGLE_READ_MODE: 'toggleReadMode',
    COPY_LINKS: 'copyLinks',
    CAPTURE_PAGE: 'capturePage',
    SHOW_DIAGNOSTICS: 'showDiagnostics',
    TOGGLE_OVERLAY: 'toggleOverlay',
    HELP: 'help',
  }),
});
