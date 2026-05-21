# CURRENT_STATE.md

## Version: v0.1.0

### Status: Phase 0 Complete — Working Baseline

---

## What This Is

The first loadable, working baseline of Internet Control Panel.
An empty repository has been turned into a real Chrome Manifest V3 extension
with a Shadow DOM overlay, command registry, local ledger, popup, and options page.

---

## What Works

- Extension loads in Chrome via Load Unpacked (Developer Mode)
- Shadow DOM overlay injects on all normal webpages
- Overlay can be toggled with Alt + Shift + I
- Overlay panel can be dragged by the header
- Overlay panel can be collapsed/expanded
- **Clean Page** removes cookie banners and modal overlays (conservative selectors)
- **Read Mode** applies a clean readable layout and can be reverted
- **Copy Links** copies all page links to clipboard
- **Capture Page** saves a ledger entry to `chrome.storage.local`
- **Diagnostics** shows link, image, script, form, and word counts
- **Hide Panel** hides the overlay (hotkey restores it)
- Command input accepts: `clean`, `read`, `links`, `capture`, `diag`, `hide`, `help`
- Popup shows overlay status and tab info, buttons work
- Options page saves settings, exports ledger as JSON, clears ledger
- Healthcheck passes (`npm run healthcheck`)
- Site adapter detection works (YouTube, GitHub, eBay, Gumroad, generic)

---

## What Does Not Exist Yet

- No command history in the input field
- No panel position persistence across page loads
- No resize handle on the panel
- No command palette (Phase 3)
- No site-specific adapter behaviors (Phase 5)
- No AI features (Phase 7)
- No automated test suite
- No extension icons (placeholder README in `extension/icons/`)
- No packaged release build

---

## Known Risks

- Content scripts do not run on `chrome://`, `chrome-extension://`, or file:// pages
  by default — overlay will not appear there
- Message passing can silently fail on pages where the content script hasn't loaded
  yet (popup shows a friendly message in that case)
- Clean Page uses conservative CSS selectors and may miss some banners or remove
  elements it shouldn't in edge cases
- Read Mode modifies `document.body` inline styles; very complex SPAs may not
  revert cleanly (original style string is preserved and restored on toggle-off)
- Shadow DOM overlay CSS assumes a dark terminal aesthetic — this is intentional

---

## Next Step

Begin Phase 1: Stable Extension Shell.
See `ROADMAP.md` for Phase 1 tasks.
