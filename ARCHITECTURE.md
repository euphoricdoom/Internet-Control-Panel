# ARCHITECTURE.md

## Overview

Internet Control Panel is a Chrome Manifest V3 browser extension.
It has no build step. The extension folder loads directly into Chrome.

---

## System Diagram

```
Browser Page
  └─> Content Script (core/*.js → content.js)
        └─> Shadow DOM Overlay (overlay.css + DOM runtime)
              └─> Command Registry (core/commands.js)
                    ├─> Storage / Ledger (core/storage.js, core/ledger.js)
                    ├─> Diagnostics (core/diagnostics.js)
                    └─> Adapters (core/adapters.js)

Popup (popup.html / popup.js)
  └─> chrome.tabs.sendMessage → Content Script

Background Service Worker (background.js)
  └─> chrome.storage.local (default settings)
  └─> chrome.runtime.onMessage (message routing)
```

---

## Components

### Extension Shell

The Chrome extension wrapper: `manifest.json`, permissions, host permissions,
content script declarations, popup, options page, background service worker.
All files inside `extension/`.

### Background Service Worker (`background.js`)

Handles the `install` event, initialises default settings, and acts as a message
router. Keeps no persistent state beyond `chrome.storage.local`. No alarms, no
external calls, no timers in v0.1.0.

### Content Runtime (`content.js` + `core/*.js`)

Loaded into every page at `document_idle`.
- Injects a Shadow DOM host element (`#icp-root`)
- Builds the overlay panel inside the shadow root
- Registers all commands with `ICPCommands`
- Listens for hotkey (Alt + Shift + I)
- Listens for messages from popup/background

Core modules are loaded as plain scripts (no ES modules) and export globals via
`globalThis`.

### Shadow DOM Overlay Runtime

The panel lives inside a Shadow DOM attached to `#icp-root`. This prevents any
leakage of panel styles into the host page and prevents host page styles from
breaking the panel.

`overlay.css` is loaded into the shadow root via a `<link>` element. `content.css`
only styles the host element (`#icp-root`) from the outside.

### Command Registry (`core/commands.js`)

`globalThis.ICPCommands` — a simple synchronous registry with async handlers.

- `register(name, handler, metadata)` — add a command
- `run(nameOrAlias, context)` — execute a command
- `list()` — enumerate all commands

Aliases allow short input names (`clean`, `read`, `diag`, etc.) to resolve to
canonical command names.

### Local Storage Wrapper (`core/storage.js`)

`globalThis.ICPStorage` — wraps `chrome.storage.local` with safe async helpers.
Falls back gracefully if storage is unavailable.

### Ledger (`core/ledger.js`)

`globalThis.ICPLedger` — creates and persists page capture entries.
Entries are stored as a JSON array under the `icpLedger` key.
Text preview is capped at 1200 characters.

### Diagnostics (`core/diagnostics.js`)

`globalThis.ICPDiagnostics` — collects safe, non-sensitive page metrics.
Does not read form values, cookies, passwords, tokens, or localStorage.

### Adapter Detection (`core/adapters.js`)

`globalThis.ICPAdapters` — detects known site patterns (YouTube, GitHub, eBay,
Gumroad) and returns adapter metadata. No site-specific logic implemented yet.

### Popup (`popup.html` / `popup.js`)

Simple action popup. Queries the active tab, sends messages to the content script,
and shows status. Fails gracefully if no content script is available.

### Options Page (`options.html` / `options.js`)

Settings form backed by `chrome.storage.local`. Supports ledger export (JSON
download) and ledger clear. Shows privacy model notes.

---

## Future: Local AI Sidecar Hooks

Phase 7 will add optional hooks for local AI inference via LM Studio or Ollama.
This is strictly opt-in, local-only, and not part of the default extension behaviour.
No cloud AI will ever be a default.

---

## Security Model

- Shadow DOM isolates overlay from host page styles
- No `eval`, no `innerHTML` with untrusted content
- No external network calls
- Content Security Policy enforced by Manifest V3 defaults
- Passwords, cookies, tokens, and form values are never read
