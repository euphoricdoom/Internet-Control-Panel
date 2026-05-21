# DECISIONS.md

Records architectural and engineering decisions with rationale.
Append new decisions; do not delete existing ones.

---

## D-001 — Use Manifest V3

**Decision:** Chrome Manifest V3 only.

**Rationale:** Manifest V2 is deprecated and will be removed by Google. Building on
V3 from day one avoids a forced migration later. Service worker model requires minor
adaptations but is the correct long-term target.

---

## D-002 — Plain JavaScript (No Framework)

**Decision:** No React, Vue, Svelte, or any UI framework. No TypeScript.

**Rationale:** The extension must load without a build step. Adding a framework
introduces build complexity, bundle size, and framework version lock-in. Plain JS is
sufficient for the overlay UI at this scale.

---

## D-003 — Shadow DOM for Overlay

**Decision:** Inject the overlay inside a Shadow DOM attached to a host element.

**Rationale:** Shadow DOM provides style encapsulation. The overlay's CSS does not
leak into the host page, and the host page's CSS does not break the overlay. This
satisfies the hard constraint of not polluting global page CSS.

---

## D-004 — chrome.storage.local (No External DB)

**Decision:** All persistent data uses `chrome.storage.local`. No IndexedDB, no
remote database, no cloud sync.

**Rationale:** `chrome.storage.local` is the simplest, most accessible local storage
API available to extensions. It works offline, requires no setup, and can be
inspected in Chrome DevTools. Keeps the local-first model intact.

---

## D-005 — No Cloud Calls

**Decision:** The extension makes zero external network requests.

**Rationale:** Local-first is a hard product constraint. Adding any default network
call would compromise trust, introduce a single point of failure, and potentially
expose user browsing behaviour.

---

## D-006 — No AI in Baseline

**Decision:** No AI or ML features in v0.1.0.

**Rationale:** Build a solid, stable shell first. AI features are complex, require
careful privacy design, and should be strictly opt-in. Parking AI in Phase 7 ensures
the core tool is trustworthy before adding inference layers.

---

## D-007 — No Build Step

**Decision:** The extension runs directly from source. No webpack, Rollup, esbuild,
or Parcel.

**Rationale:** A build step adds complexity, requires Node tooling, and can introduce
hidden dependencies. The extension should be loadable by a user with only Chrome
installed.

---

## D-008 — globalThis Namespaces for Core Modules

**Decision:** Core modules export to `globalThis` (e.g., `globalThis.ICPStorage`)
rather than using ES module imports.

**Rationale:** Manifest V3 content scripts declared in `manifest.json` are loaded as
classic scripts, not ES modules. ES module imports in classic scripts do not work
without a `type="module"` worker or a bundler. `globalThis` namespaces are the
correct pattern for sequential classic-script loading.

---

## D-009 — Local-First Extension Shell Before Advanced Automation

**Decision:** Establish a stable, boring, inspectable baseline before adding
automation, adapters, or AI.

**Rationale:** A complex unstable system is worse than a simple stable one. Each
phase must be shippable and trustworthy before the next phase begins.
