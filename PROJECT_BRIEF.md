# PROJECT_BRIEF.md

## North Star

Give the user local control over the internet interface layer by injecting a safe,
persistent, user-owned overlay runtime into webpages.

---

## Problem

The modern browser is a passive viewport. Web pages push content, ads, overlays, and
dark patterns onto the user. The user has no persistent, local, owned control layer
sitting between them and the web.

---

## User

A technically aware individual who wants to:
- Clean up noisy pages without installing a dozen separate extensions
- Capture page context locally without depending on cloud bookmarking services
- Run quick actions on pages without leaving the keyboard
- Keep their browsing data local and under their own control

---

## Core Value

A single, local, always-present browser control layer that the user owns entirely.
No subscriptions. No cloud. No data leaving the machine.

---

## First Milestone

A loadable Chrome Manifest V3 extension with:
- Persistent Shadow DOM overlay
- Page clean, read mode, link copy, page capture, diagnostics commands
- Local ledger backed by `chrome.storage.local`
- Popup and options pages
- Passing healthcheck

---

## Non-Goals (for v0.1.0)

- No AI integration
- No backend services
- No remote API calls
- No user accounts
- No browser sync
- No cross-device features
- No automated testing harness (manual test plan only)
- No payment or monetization layer
- No telemetry or analytics

---

## Privacy Principle

All data stays on the local machine. No data is ever sent to any external service
unless the user explicitly requests a future opt-in feature (and even then, only with
full transparency and user control).

---

## Local-First Principle

The extension must be fully functional with no internet connection at all. If the
internet disappears, the extension still works.
