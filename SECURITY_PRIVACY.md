# SECURITY_PRIVACY.md

## Local-First Model

Internet Control Panel is a local-first browser extension. All functionality operates
entirely within the user's browser. No data is transmitted to any external server,
API, or third-party service by default or by design.

---

## What Data Is Stored

The following data may be stored in `chrome.storage.local`:

| Key | Contents |
|---|---|
| `icpSettings` | User preferences: overlay enabled flag, read mode default, capture preview character limit |
| `icpLedger` | Page capture entries: URL, title, capture timestamp, text preview (≤1200 chars), link count, image count, word count |

All data is stored locally on the user's device inside Chrome's extension storage.

---

## What Data Is NOT Stored

The extension explicitly avoids storing:

- Passwords
- Authentication tokens or session cookies
- Form field values of any kind
- Credit card numbers or financial data
- `localStorage` or `sessionStorage` contents from visited pages
- Precise geolocation data
- Browser history beyond user-triggered captures
- Any data from `chrome://` or `chrome-extension://` pages

---

## No External Network Calls

The extension makes **zero** external network requests. There are no:

- Analytics calls
- Error reporting calls
- CDN requests
- Remote configuration endpoints
- Cloud sync endpoints
- Telemetry beacons

All CSS and JS is bundled within the extension package.

---

## No Remote Scripts

No scripts are loaded from remote URLs. All code is included in the extension package
and reviewed before installation.

---

## Host Permissions Explanation

The manifest declares `host_permissions: ["<all_urls>"]`.

This is required to inject the content script overlay on all pages the user visits.
It does **not** grant the extension permission to make network requests to those
hosts. The extension does not use this permission to fetch remote resources.

---

## User Control Model

The user has full control over their data:

- **Export:** Download all ledger entries as a JSON file (Options page)
- **Clear:** Delete all ledger entries (Options page, with confirmation)
- **Disable:** Uncheck "Enable overlay" in Options to prevent injection on load
- **Remove:** Uninstalling the extension removes all stored data

---

## Future Review Checklist

Before adding any new data collection in future phases:

- [ ] Is the data necessary for a user-visible feature?
- [ ] Is the data stored locally only?
- [ ] Does the user know this data is being stored?
- [ ] Can the user export this data?
- [ ] Can the user delete this data?
- [ ] Is the data excluded from passwords, tokens, cookies, form values?
- [ ] Is there no remote transmission of this data?

All boxes must be checked before adding new data collection.

---

## Shadow DOM Isolation

The overlay panel uses Shadow DOM, which provides:

- Style isolation (extension CSS does not affect the host page)
- DOM isolation (host page scripts cannot easily access extension panel internals)

This reduces the attack surface from both sides.

---

## Content Security Policy

Manifest V3 extensions enforce a strict CSP by default:

- `eval` is disallowed
- Inline scripts in extension pages are restricted
- Remote script loading is disallowed

The extension complies with these defaults and does not attempt to relax them.
