/**
 * Internet Control Panel — Storage
 * Wraps chrome.storage.local with safe async helpers.
 * Sets globalThis.ICPStorage.
 */

'use strict';

globalThis.ICPStorage = (() => {
  function storageAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  async function get(key, fallbackValue = null) {
    if (!storageAvailable()) return fallbackValue;
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          console.warn('[ICPStorage] get error:', chrome.runtime.lastError.message);
          resolve(fallbackValue);
        } else {
          resolve(key in result ? result[key] : fallbackValue);
        }
      });
    });
  }

  async function set(key, value) {
    if (!storageAvailable()) return;
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          console.warn('[ICPStorage] set error:', chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  async function remove(key) {
    if (!storageAvailable()) return;
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          console.warn('[ICPStorage] remove error:', chrome.runtime.lastError.message);
        }
        resolve();
      });
    });
  }

  async function appendToList(key, item, maxItems = 500) {
    const existing = await get(key, []);
    const list = Array.isArray(existing) ? existing : [];
    list.push(item);
    const trimmed = list.length > maxItems ? list.slice(list.length - maxItems) : list;
    await set(key, trimmed);
  }

  async function clearLedger() {
    await remove(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.LEDGER
        : 'icpLedger',
    );
  }

  async function getSettings() {
    const defaults = globalThis.ICP_CONSTANTS
      ? globalThis.ICP_CONSTANTS.DEFAULT_SETTINGS
      : {};

    const existing = await get(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.SETTINGS
        : 'icpSettings',
      {},
    );

    return Object.assign({}, defaults, existing || {});
  }

  async function setSettings(partialSettings) {
    const current = await getSettings();
    const merged = Object.assign({}, current, partialSettings || {});

    await set(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.SETTINGS
        : 'icpSettings',
      merged,
    );

    return merged;
  }

  async function getOverlayState() {
    const defaults = globalThis.ICP_CONSTANTS
      ? globalThis.ICP_CONSTANTS.DEFAULT_OVERLAY_STATE
      : {};

    const existing = await get(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.OVERLAY_STATE
        : 'icpOverlayState',
      {},
    );

    return Object.assign({}, defaults, existing || {});
  }

  async function setOverlayState(partialState) {
    const current = await getOverlayState();
    const merged = Object.assign({}, current, partialState || {});

    await set(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.OVERLAY_STATE
        : 'icpOverlayState',
      merged,
    );

    return merged;
  }

  return Object.freeze({
    get,
    set,
    remove,
    appendToList,
    clearLedger,
    getSettings,
    setSettings,
    getOverlayState,
    setOverlayState,
  });
})();