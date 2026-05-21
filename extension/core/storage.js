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

  /**
   * Get a value from storage.
   * @param {string} key
   * @param {*} fallbackValue
   * @returns {Promise<*>}
   */
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

  /**
   * Set a value in storage.
   * @param {string} key
   * @param {*} value
   * @returns {Promise<void>}
   */
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

  /**
   * Remove a key from storage.
   * @param {string} key
   * @returns {Promise<void>}
   */
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

  /**
   * Append an item to a stored list, capped at maxItems.
   * @param {string} key
   * @param {*} item
   * @param {number} maxItems
   * @returns {Promise<void>}
   */
  async function appendToList(key, item, maxItems = 500) {
    const existing = await get(key, []);
    const list = Array.isArray(existing) ? existing : [];
    list.push(item);
    const trimmed = list.length > maxItems ? list.slice(list.length - maxItems) : list;
    await set(key, trimmed);
  }

  /**
   * Clear the ledger from storage.
   * @returns {Promise<void>}
   */
  async function clearLedger() {
    await remove(
      globalThis.ICP_CONSTANTS
        ? globalThis.ICP_CONSTANTS.STORAGE_KEYS.LEDGER
        : 'icpLedger',
    );
  }

  return Object.freeze({ get, set, remove, appendToList, clearLedger });
})();
