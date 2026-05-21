# ROADMAP.md

Phases are locked. Do not skip ahead or mix concerns across phases.
Future ideas belong in `IDEA_PARKING_LOT.md`, not here.

---

## Phase 0 — Repo Foundation ✅ (v0.1.0)

- [x] Create governance docs
- [x] Create loadable Manifest V3 extension
- [x] Add healthcheck script
- [x] Baseline overlay with Shadow DOM
- [x] Core modules: constants, storage, ledger, diagnostics, adapters, commands, messaging
- [x] Popup and options pages
- [x] Local ledger with page capture
- [x] Manual test plan

---

## Phase 1 — Stable Extension Shell

- [ ] Harden message passing (connection error boundaries)
- [ ] Improve state persistence (overlay position, collapsed state)
- [ ] Add extension reload workflow docs
- [ ] Improve error display in overlay output
- [ ] Validate command input more robustly
- [ ] Add overlay drag bounds clamping
- [ ] Improve popup status refresh after commands

---

## Phase 2 — Overlay Kernel

- [ ] Resizable panel
- [ ] Command history (up/down in input)
- [ ] Better result console (timestamps, log levels)
- [ ] Keyboard navigation inside panel
- [ ] Panel persistence across page navigations (re-inject on SPA route change)

---

## Phase 3 — Command Palette

- [ ] VS Code–style command palette (Alt+Shift+P)
- [ ] Command search and fuzzy match
- [ ] Command aliases managed from options
- [ ] User-defined commands (simple scripted)

---

## Phase 4 — Local Ledger and Capture

- [ ] Better capture format (structured sections)
- [ ] Import/export with version field
- [ ] Search within captures
- [ ] Tagging and filtering
- [ ] Ledger viewer page

---

## Phase 5 — Site Adapters

- [ ] YouTube: video metadata, chapter detection
- [ ] GitHub: repo stats, issue count
- [ ] eBay: listing price, condition
- [ ] Gumroad: product price, type
- [ ] Generic article pages: title, author, reading time

---

## Phase 6 — Diagnostics and Privacy Controls

- [ ] Page risk indicators (ad script count, tracker patterns)
- [ ] Request visibility where permitted by Manifest V3 APIs
- [ ] Permission review helper
- [ ] Full data export (all ledger + settings)
- [ ] Privacy dashboard in options

---

## Phase 7 — Local AI Sidecar Hooks

- [ ] LM Studio / Ollama local endpoint support
- [ ] User opt-in only — no cloud default
- [ ] Page summarisation (local model)
- [ ] Command suggestions from page context
- [ ] No data leaves the machine without explicit user action

---

## Phase 8 — Packaged Release

- [ ] Versioned release build
- [ ] Extension package (.crx / ZIP)
- [ ] User guide
- [ ] Chrome Web Store submission (optional)
