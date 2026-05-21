/**
 * Internet Control Panel — Adapters
 * Detects the current site and returns adapter metadata.
 * Sets globalThis.ICPAdapters.
 *
 * No site-specific behavior is implemented yet — detection only.
 */

'use strict';

globalThis.ICPAdapters = (() => {
  const ADAPTER_MAP = [
    {
      test: (h) => h === 'www.youtube.com' || h === 'youtube.com' || h === 'youtu.be',
      id: 'youtube',
      label: 'YouTube',
      capabilities: [],
    },
    {
      test: (h) => h === 'github.com' || h.endsWith('.github.com'),
      id: 'github',
      label: 'GitHub',
      capabilities: [],
    },
    {
      test: (h) => h === 'www.ebay.com' || h === 'ebay.com',
      id: 'ebay',
      label: 'eBay',
      capabilities: [],
    },
    {
      test: (h) => h === 'gumroad.com' || h.endsWith('.gumroad.com'),
      id: 'gumroad',
      label: 'Gumroad',
      capabilities: [],
    },
  ];

  /**
   * Detect the adapter for the current page.
   * @returns {{ hostname: string, adapterId: string, label: string, capabilities: string[] }}
   */
  function detect() {
    const hostname = location.hostname.toLowerCase();
    const match = ADAPTER_MAP.find((a) => a.test(hostname));
    if (match) {
      return {
        hostname,
        adapterId: match.id,
        label: match.label,
        capabilities: match.capabilities,
      };
    }
    return {
      hostname,
      adapterId: 'generic',
      label: 'Generic',
      capabilities: [],
    };
  }

  return Object.freeze({ detect });
})();
