# SentinelID — Identity Manager (UI Prototype)

This is a small, self-contained HTML/CSS/JS prototype for the SentinelID UI described by the product spec.

What you get
- `index.html` — a single-page UI with sections for Alias Manager, Password Generator, Leak Detection, Virtual Sessions, and Agentic Mode.
- `styles.css` — responsive styling, dark theme, accessible-ish controls.
- `app.js` — client-side JS implementing core interactions and a tiny localStorage-backed demo state.

How to run
1. Open `index.html` in your browser (double-click or use your editor's Live Server). No build step required.

Notes and next steps
- This is a front-end prototype only. For a production app you'll want to:
  - Add an encrypted vault (backend) for persisted secret storage.
  - Integrate real leak-check APIs (HaveIBeenPwned or similar) and rate-limit calls.
  - Implement secure autofill and browser extension hooks for form injection.
  - Improve UI tests and accessibility (keyboard flows, screen-reader labels).

License
- Prototype code for internal use. Feel free to adapt.
