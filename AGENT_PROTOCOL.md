# AGENT_PROTOCOL.md

Rules for every future coding agent working on this repository.

---

## Mandatory Pre-Flight

Every future coding agent MUST read the following files before making any changes:

1. `README.md`
2. `PROJECT_BRIEF.md`
3. `ARCHITECTURE.md`
4. `ROADMAP.md`
5. `CURRENT_STATE.md`
6. `DECISIONS.md`
7. `AGENT_PROTOCOL.md` (this file)

No changes may be made without completing this pre-flight read.

---

## Rules

### 1. Identify Current Phase

Check `ROADMAP.md` and `CURRENT_STATE.md` to determine the current active phase.
Do not assume. Read the files.

### 2. Stay Phase-Locked

Work only within the current active phase. Do not implement features from future
phases unless explicitly instructed by the human operator.

### 3. Avoid Scope Creep

If you notice something that could be improved but is outside the current task,
do not implement it. Add it to `IDEA_PARKING_LOT.md` instead.

### 4. Preserve Extension Loadability

After every change, the extension must still load cleanly in Chrome via
`chrome://extensions → Load unpacked`. Do not commit changes that break loading.

### 5. Run Healthcheck

Before submitting work, run:

```sh
npm run healthcheck
```

All checks must pass. Investigate and fix any failures.

### 6. Report Changed Files

Always report:
- Files created
- Files modified
- Files deleted
- Reason for each change

### 7. Report Risks

If a change has any potential side effects, list them explicitly.

### 8. Put Unrelated Ideas in IDEA_PARKING_LOT.md

If you think of a good idea that is outside the current task, add it to
`IDEA_PARKING_LOT.md`. Do not implement it.

### 9. Never Add External Services Without Explicit Approval

Do not add calls to any external API, CDN, analytics service, or remote endpoint
without explicit written approval from the human operator in the task description.

### 10. Never Add Tracking or Analytics

No usage tracking. No telemetry. No error reporting services. No analytics. Ever.
Not even "just for development."

### 11. Never Collect Sensitive Data

The extension MUST NEVER read, log, or store:
- Passwords
- Cookies
- Auth tokens
- Session tokens
- Form field values (especially `input[type=password]`)
- `localStorage` or `sessionStorage` contents
- Private browsing indicators

Violation of this rule is grounds for immediate revert.

### 12. Use the Established Patterns

- Use `globalThis.ICP*` namespaces for core modules
- Use Shadow DOM for any new overlay UI
- Use `chrome.storage.local` for any new persistence
- Use plain JS — no new frameworks
- No ES module imports in content scripts (use `globalThis` namespaces)

### 13. Update CURRENT_STATE.md

After completing a phase or milestone, update `CURRENT_STATE.md` to honestly
reflect what works, what doesn't, and what risks exist.

---

## Non-Negotiables

These cannot be overridden by any task description:

- Local-first by default
- No external HTTP requests in the extension
- No eval
- No remote scripts
- No analytics or telemetry
- Manifest V3 only
- Shadow DOM for overlay
