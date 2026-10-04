# TutorDek completion verification

Specification: [TutorDek completion specification](../.scratch/finish-tutordek/spec.md).

## Automated gate

- Python domain/HTTP suite: registration, hashing, cookies, authentication/expiry/logout, CSRF and body validation, static-file boundaries, legacy redirects, valid dates/tutor compatibility, simultaneous allocation, learner overlap, pricing/promos, idempotent simulated checkout, cancellation, time-gated completion/reviews, account isolation, persistence, lessons/packages, quiz scoring, forum/replies and assistant grounding.
- Playwright: account lifecycle; manual booking/checkout; automatic offline matching; stale grade reset/back navigation; session notes/PNG export; ebook download/completion; quiz scores, goals/packages; forum escaping/replies; sourced assistant history; outgoing messages; legacy routing/FAQ/mobile navigation; all-screen layout/axe checks; reduced motion/keyboard focus.
- Databases are temporary. Test clocks exercise completion/reviews without a production shortcut.

## Scope of evidence

Desktop Chromium and a 390px Android-style Chromium viewport cover the browser gate. Axe checks testable WCAG A/AA rules; it does not establish full accessibility conformance. The optional whiteboard is pointer based; text notes provide a keyboard-accessible study workflow. Screenshots inspect home, booking, dashboard and library layouts.

External payments, email, live video, physical devices, other browser engines, production scale and model-backed RAG are not exercised because they are not part of this local application.

## Findings addressed

- Explicit control labels prevent a password button or select options from polluting label text.
- Pending logout respects navigation while its request finishes.
- Changing preselected tutor resets incompatible saved booking steps/schedule.
- Original assets avoid CDN fonts, placeholder map keys and case-sensitive script paths.
- Dialogs explicitly cycle Tab focus; Escape dismisses them and restores the invoking control.
- Decorative package numbers and inline links meet contrast/identification rules; route animations move content without fading its text contrast.
- Same-second activity keeps insertion order, and a disconnected response socket is handled without retrying an error response. A focused regression was observed failing before this transport fix and passing afterward.

## Final result

On **4 October 2026**, `npm test` passed **26 Python domain/HTTP tests and 14 Playwright tests**. Desktop/mobile user journeys, all-screen axe checks, 320px/390px layout checks, downloads, keyboard dialogs and reduced motion passed. No uncaught browser exceptions or failed app asset requests were observed. The final browser run completed in 44.9 seconds; Python tests completed in 2.218 seconds on this Windows workspace (Python 3.12.7, Node 22.12.0).

`npm run format:check` and `git diff --check` passed. Desktop and mobile home, booking, library and dashboard screenshots were inspected. The npm dependency installation audit reported zero known vulnerabilities. Runtime data, reports, generated screenshots and dependencies are ignored by Git. These are local verification results; the repository workflow independently repeats the gate on Linux after push.
