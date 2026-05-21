# Internet Control Panel

> Local-first browser control overlay and page capture layer.

## What This Is

Internet Control Panel is a Chrome Manifest V3 browser extension that injects a
persistent, user-owned overlay runtime into webpages. It gives you local control over
the browser interface layer — clean pages, capture context, inspect diagnostics, run
commands, and store local notes — without any cloud dependency.

**Current status:** v0.1.1 — Phase 1 hardening complete. Messaging is normalized,
overlay state persistence is stabilized, popup handling is more defensive, and
healthcheck includes additional security and consistency checks.

---

## Healthcheck

```sh
npm run healthcheck
```

Verifies that all required files are present and the manifest is valid.

---

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside this repository
5. Open any normal webpage (not `chrome://` or `chrome-extension://`)
6. Use **Alt + Shift + I** to toggle the control panel

---

## Using the Overlay

| Element | Purpose |
|---|---|
| **Clean Page** | Removes common clutter (cookie banners, GDPR notices, modal overlays) |
| **Read Mode** | Applies a clean readable layout. Click again to restore original styles |
| **Copy Links** | Copies all page links to clipboard |
| **Capture Page** | Saves a ledger entry with page metadata to local storage |
| **Diagnostics** | Shows link, image, script, form, and word counts |
| **Hide Panel** | Hides the overlay; use Alt+Shift+I to restore |
| **Command input** | Type commands: `clean`, `read`, `links`, `capture`, `diag`, `hide`, `help` |
| **Header** | Drag to reposition the panel |
| **▲ button** | Collapse / expand the panel body |

### Hotkey

**Alt + Shift + I** — toggle overlay visibility from anywhere on the page.
**Alt + Space** — reserved for future command palette (not implemented yet).

---

## Privacy Model

- **All data is local.** Nothing leaves your browser.
- `chrome.storage.local` only — no IndexedDB, no remote endpoints.
- No analytics, no telemetry, no tracking.
- No form values, cookies, passwords, or tokens are ever read or stored.
- You can export or clear all ledger data from the Options page.

---

## Development Rules

1. No external HTTP requests.
2. No remote scripts.
3. No `eval`.
4. No framework.
5. No build step required.
6. Manifest V3 only.
7. All extension code lives in `extension/`.
8. All governance docs live at repo root.
9. Future ideas go in `IDEA_PARKING_LOT.md`, not in implementation.
10. Run `npm run healthcheck` before committing.
11. Follow phase discipline in `ROADMAP.md`.
12. Read `AGENT_PROTOCOL.md` before making any agentic changes.
