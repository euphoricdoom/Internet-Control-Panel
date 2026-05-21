# TEST_PLAN.md

Manual test plan for Internet Control Panel v0.1.0.

Automated test harness is not yet implemented. All tests are manual.

---

## Pre-Test Setup

1. Run `npm run healthcheck` — must show `PASS` with zero failures
2. Open `chrome://extensions`
3. Enable Developer Mode
4. Click Load unpacked → select `extension/` folder
5. Verify extension appears with no errors in the extensions list
6. Open a normal webpage (e.g., `https://example.com`)

---

## Test Cases

### TC-01 — Healthcheck Passes

**Steps:** Run `npm run healthcheck`
**Expected:** All checks PASS, zero failures

---

### TC-02 — Extension Loads

**Steps:** Load unpacked from `extension/` folder
**Expected:** Extension appears in `chrome://extensions` with no red error banners

---

### TC-03 — Overlay Appears on Normal Webpage

**Steps:** Open `https://example.com` or any normal HTTP/S page
**Expected:** ICP panel appears in top-right corner, showing "⚙ ICP" in the header

---

### TC-04 — Hotkey Toggles Overlay

**Steps:** Press `Alt + Shift + I`
**Expected:** Panel hides. Press again — panel reappears.

---

### TC-05 — Panel Drags

**Steps:** Click and drag the panel header
**Expected:** Panel follows the cursor to the new position

---

### TC-06 — Panel Collapses and Expands

**Steps:** Click the ▲ button in the panel header
**Expected:** Panel body collapses (only header visible). Click ▼ to re-expand.

---

### TC-07 — Clean Page Runs

**Steps:** Open a page with cookie banners (e.g., any news site). Click "Clean Page".
**Expected:** Output shows count of removed elements. Banner visibly disappears.
On `example.com` (no banner), output should show 0 removed — no error.

---

### TC-08 — Read Mode Toggles On and Off

**Steps:** Click "Read Mode"
**Expected:** Page body styles update (max-width, font, background). Output confirms "Read mode enabled."
**Steps:** Click "Read Mode" again
**Expected:** Original styles restored. Output confirms "Read mode disabled."

---

### TC-09 — Copy Links Works

**Steps:** On a page with links, click "Copy Links"
**Expected:** Output shows count of links copied. Paste into a text editor to verify.

---

### TC-10 — Capture Page Writes Ledger Entry

**Steps:** Click "Capture Page"
**Expected:** Output shows "Page captured to ledger." Open Options → Export Ledger →
verify JSON file contains the entry with correct URL and title.

---

### TC-11 — Diagnostics Displays

**Steps:** Click "Diagnostics"
**Expected:** Output shows link count, image count, script count, form count, word count.
Data should match the visible content of the page.

---

### TC-12 — Command Input Works

**Steps:** Type `help` in the command input, click Run or press Enter
**Expected:** Output lists all available commands with their aliases and descriptions.

**Steps:** Type `diag` in the command input
**Expected:** Same result as clicking Diagnostics button.

**Steps:** Type `clean` in the command input
**Expected:** Same result as clicking Clean Page button.

---

### TC-13 — Hide Panel via Command

**Steps:** Type `hide` in the command input and press Enter
**Expected:** Panel hides. Press Alt+Shift+I to restore.

---

### TC-14 — Adapter Label Displays

**Steps:** Open `https://github.com` (or YouTube)
**Expected:** Header shows adapter label e.g. `[GitHub]` or `[YouTube]`
**Steps:** Open `https://example.com`
**Expected:** Header shows `[Generic]`

---

### TC-15 — Popup Buttons Work

**Steps:** Click the extension icon in the Chrome toolbar
**Expected:** Popup opens showing "⚙ Internet Control Panel", status area with tab info

**Steps:** Click "Toggle Overlay"
**Expected:** Overlay toggles. Status updates.

**Steps:** Click "Capture Page"
**Expected:** Capture confirmation shown in popup status.

**Steps:** Click "Diagnostics"
**Expected:** Link/image/script/form/word counts shown in popup status.

**Steps:** Click "Open Options"
**Expected:** Options page opens.

---

### TC-16 — Popup on Non-Content-Script Page

**Steps:** Open `chrome://extensions` or `about:blank`. Click extension icon.
**Expected:** Popup shows friendly message: "Content runtime not available on this page."

---

### TC-17 — Options Save

**Steps:** Open Options. Uncheck "Enable overlay on page load". Click Save.
**Expected:** Status shows "Settings saved." Reload Options page — checkbox remains unchecked.

---

### TC-18 — Ledger Export Works

**Steps:** Capture at least one page. Open Options. Click "Export Ledger (JSON)".
**Expected:** JSON file downloads. File contains `entries` array with the capture.

---

### TC-19 — Ledger Clear Works

**Steps:** Open Options. Click "Clear Ledger". Confirm.
**Expected:** Status shows "Ledger cleared." Export again — `entries` array is empty.

---

### TC-20 — No Global CSS Pollution

**Steps:** Open a page with custom styling (e.g., `https://github.com`). Verify the page looks normal with and without the extension loaded.
**Expected:** No visible style differences on the host page attributable to the extension.

---

### TC-21 — Overlay Position Persistence

**Steps:** Drag the panel to a custom position. Reload the page.
**Expected:** Panel restores to the saved position and remains within viewport bounds.

---

### TC-22 — Collapse Persistence

**Steps:** Collapse the panel with ▲/▼ control. Reload the page.
**Expected:** Panel remains collapsed until manually expanded.

---

### TC-23 — Overlay Visibility Persistence

**Steps:** Hide panel with command `hide` (or toggle). Reload the page.
**Expected:** Visibility state persists and can still be toggled with `Alt + Shift + I`.

---

### TC-24 — Settings Compatibility on Runtime Init

**Steps:** In Options, disable overlay on page load and enable read mode default. Reload a normal page.
**Expected:** Overlay starts hidden; if shown, read mode is active by default.

---

### TC-25 — Popup Defensive Handling

**Steps:** Open popup on a restricted page (`chrome://extensions`) and on a normal webpage.
**Expected:** Restricted page shows friendly unavailable-runtime status. Normal page actions still work.

---

### TC-26 — Healthcheck Security and Consistency

**Steps:** Run `npm run healthcheck`.
**Expected:** PASS output includes checks for `CHANGELOG.md`, no `eval`, no direct remote fetch/script tags in extension source, and version consistency across package/manifest/constants.

---

## Quality Bar

The extension must be boring-stable. A small working system is better than a flashy
broken system. All 26 test cases must pass before releasing any version increment.
