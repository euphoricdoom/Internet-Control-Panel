# CURRENT_STATE.md

## Version: v0.1.1

### Status: Phase 1 Complete — Stable Extension Shell

---

## What This Is

The baseline extension has been hardened for reliability before entering
Overlay Kernel work. Message handling, popup behavior, and persistence paths
are now normalized and better defended.

---

## What Works

- Extension loads in Chrome via Load Unpacked (Developer Mode)
- Shadow DOM overlay injects on all normal webpages
- Overlay can be toggled with Alt + Shift + I
- Overlay panel can be dragged by the header
- Overlay panel can be collapsed/expanded
- Overlay visibility/collapse/position persist across page reloads
- Overlay defaults now respect settings (`overlayEnabled`, `readModeDefault`)
- **Clean Page** removes cookie banners and modal overlays (conservative selectors)
- **Read Mode** applies a clean readable layout and can be reverted
- **Copy Links** copies all page links to clipboard
- **Capture Page** saves a ledger entry to `chrome.storage.local`
- **Diagnostics** shows link, image, script, form, and word counts
- **Hide Panel** hides the overlay (hotkey restores it)
- Command input accepts: `clean`, `read`, `links`, `capture`, `diag`, `hide`, `help`
- Popup uses defensive response normalization and graceful unavailable-runtime handling
- Background responses are normalized to `{ ok, message, data?, error? }`
- Options page saves settings, exports ledger as JSON, clears ledger
- Healthcheck validates required docs/files, manifest integrity, security scans, and version consistency
- Site adapter detection works (YouTube, GitHub, eBay, Gumroad, generic)

---

## What Does Not Exist Yet

- No command history in the input field
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
- Some restricted pages still cannot run content scripts (`chrome://`, extension pages),
  so popup operations depend on graceful fallback messaging
- Clean Page uses conservative CSS selectors and may miss some banners or remove
  elements it shouldn't in edge cases
- Read Mode modifies `document.body` inline styles; very complex SPAs may not
  revert cleanly (original style string is preserved and restored on toggle-off)
- Shadow DOM overlay CSS assumes a dark terminal aesthetic — this is intentional

---

## Next Step

Begin Phase 2: Overlay Kernel only after confirming Issue #2 closure and
maintaining the Phase 1 stability baseline.
