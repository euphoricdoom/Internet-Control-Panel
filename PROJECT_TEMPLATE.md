# Reusable Project Template

This document is the starter template for future projects built with ChatGPT, Copilot/Codex, and GitHub.

## Standard repo spine

Every serious project should start with:

- `README.md`
- `PROJECT_BRIEF.md`
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `CURRENT_STATE.md`
- `DECISIONS.md`
- `AGENT_PROTOCOL.md`
- `IDEA_PARKING_LOT.md`
- `SECURITY_PRIVACY.md` when relevant
- `TEST_PLAN.md`
- `CHANGELOG.md`
- `.github/workflows/main.yml`

## Standard project phases

Use phases unless the project has a better domain-specific lifecycle.

### Phase 0 — Repo Foundation

- Create source-of-truth docs.
- Create minimal working baseline.
- Add healthcheck.
- Add GitHub Actions.
- Establish current state.

### Phase 1 — Stability Shell

- Harden the baseline.
- Add error handling.
- Add persistence where needed.
- Improve startup/reload behavior.
- Update docs truthfully.

### Phase 2 — Core Kernel

- Build the central runtime or engine.
- Keep features minimal.
- Favor composable primitives over flashy UI.

### Phase 3 — Operator Interface

- Improve command/control UX.
- Add keyboard flows.
- Add history/state visibility.

### Phase 4 — Local Memory / Data Layer

- Add durable local storage.
- Add import/export.
- Add search or filtering.

### Phase 5 — Adapters / Integrations

- Add external adapters only after core is stable.
- Keep integrations isolated and replaceable.

### Phase 6 — Diagnostics / QA / Privacy

- Add self-checks.
- Add manual QA checklist.
- Add release gates.

### Phase 7 — AI / Automation Hooks

- Add AI only after baseline, memory, diagnostics, and UX are stable.
- Prefer local-first.
- Make automation explicit and user-triggered.

### Phase 8 — Release Packaging

- Create versioned release.
- Add install/use guide.
- Add release checklist.

## Standard agent protocol

Every coding agent must:

1. Read source-of-truth docs first.
2. Identify current phase.
3. Stay phase-locked.
4. Avoid scope creep.
5. Put unrelated ideas in `IDEA_PARKING_LOT.md`.
6. Preserve working baseline.
7. Run available checks.
8. Report changed files.
9. Report risks and unknowns.
10. Update `CURRENT_STATE.md` and `CHANGELOG.md` after meaningful changes.

## Standard issue template

```markdown
# Phase X — Title

## Mission

## Context

## Scope

## Out of scope

## Acceptance criteria

## Files likely affected

## Final report required
```

## Standard Codex prompt shape

```markdown
You are the Phase X engineer for [PROJECT].

Before changing anything, read:
- README.md
- PROJECT_BRIEF.md
- ARCHITECTURE.md
- ROADMAP.md
- CURRENT_STATE.md
- DECISIONS.md
- AGENT_PROTOCOL.md
- TEST_PLAN.md

Current state:
[truthful current state]

Mission:
[bounded mission]

Do not add:
[out-of-scope list]

Acceptance criteria:
[checklist]

Final report required:
- Phase
- Files changed
- Checks run
- Result
- Risks
- Next recommended step
```

## Standard healthcheck pattern

Each repo should eventually have:

- required docs exist
- required code entrypoints exist
- config parses
- no missing referenced files
- no obvious external calls unless approved
- no forbidden patterns for that project

## Golden rule

Make the repo remember the project so the human does not have to keep re-explaining it.
