# Phase 1 Implementation Plan — Stable Extension Shell

Issue: #2

## Goal
Harden the v0.1.0 baseline without expanding scope.

## Files to change

- `extension/core/constants.js`
- `extension/core/storage.js`
- `extension/core/commands.js`
- `extension/core/messaging.js`
- `extension/content.js`
- `extension/popup.js`
- `extension/background.js`
- `scripts/healthcheck.js`
- `README.md`
- `CURRENT_STATE.md`
- `TEST_PLAN.md`
- `CHANGELOG.md`

## Required hardening

1. Normalize all command and message responses to `{ ok, message, data?, error? }`.
2. Persist overlay state with `chrome.storage.local`.
3. Persist panel position after dragging.
4. Restore and clamp panel position on page load.
5. Persist collapsed/expanded and visible/hidden state.
6. Add content-runtime readiness/status output.
7. Improve popup handling for restricted pages and missing content scripts.
8. Wrap command execution in a shared safe result path.
9. Keep read mode reversible.
10. Update docs and healthcheck.

## Out of scope

- AI
- backend
- cloud calls
- site-specific adapter behavior
- analytics
- telemetry
- automation macros
- scraping features
- frameworks
- build tooling

## Acceptance criteria

- `npm run healthcheck` passes.
- Extension still loads unpacked.
- Overlay still injects on normal webpages.
- Alt + Shift + I toggles overlay.
- Overlay position persists after page reload.
- Collapse state persists after page reload.
- Popup gives useful message on restricted pages.
- Popup buttons work on normal pages.
- Commands still work.
- No external network calls.
- No collection of cookies, passwords, tokens, form values, or host localStorage.
- Docs updated accurately.
