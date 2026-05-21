/**
 * Internet Control Panel — Constants
 * Loaded as a plain content script. No ES module imports.
 * Sets globalThis.ICP_CONSTANTS.
 */

'use strict';

globalThis.ICP_CONSTANTS = Object.freeze({
  VERSION: '0.1.1',

  ROOT_ID: 'icp-root',

  STORAGE_KEYS: Object.freeze({
    SETTINGS: 'icpSettings',
    LEDGER: 'icpLedger',
    OVERLAY_STATE: 'icpOverlayState',
  }),

  MESSAGE_TYPES: Object.freeze({
    TOGGLE_OVERLAY: 'ICP_TOGGLE_OVERLAY',
    GET_STATUS: 'ICP_GET_STATUS',
    CAPTURE_PAGE: 'ICP_CAPTURE_PAGE',
    SHOW_DIAGNOSTICS: 'ICP_SHOW_DIAGNOSTICS',
  }),

  COMMANDS: Object.freeze({
    CLEAN_PAGE: 'cleanPage',
    TOGGLE_READ_MODE: 'toggleReadMode',
    COPY_LINKS: 'copyLinks',
    CAPTURE_PAGE: 'capturePage',
    SHOW_DIAGNOSTICS: 'showDiagnostics',
    TOGGLE_OVERLAY: 'toggleOverlay',
    STATUS: 'status',
    HELP: 'help',
  }),

  DEFAULT_SETTINGS: Object.freeze({
    overlayEnabled: true,
    readModeDefault: false,
    capturePreviewLimit: 1200,
    maxLedgerEntries: 500,
  }),

  DEFAULT_OVERLAY_STATE: Object.freeze({
    visible: true,
    collapsed: false,
    x: null,
    y: null,
    lastAdapterLabel: 'Generic',
  }),
});