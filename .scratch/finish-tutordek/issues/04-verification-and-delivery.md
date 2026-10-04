# What evidence proves the project is ready to commit and push?

Type: grilling
Label: wayfinder:grilling
Status: resolved
Assignee: Rama Ranuh
Parent: ../map.md
Blocked by: 02, 03

## Question

Which functional, abuse-case, persistence, browser, accessibility, layout, and legacy-route checks form the delivery gate, and how should the commit chain be ordered?

## Answer

Use Python unittest against the real domain service and HTTP server with temporary databases: registration/login/expiry/logout, malformed input, unauthorized/cross-account access, CSRF, traversal/static isolation, booking validation/conflicts/concurrent attempts, automatic matching, pricing/promos, payment idempotency/state transitions, time-gated completion/reviews, messages/notes, material completion, quiz scoring/goals/enrollment, forum/replies, assistant grounding, and persistence after reinitialization.

Use Playwright with a supervised Python test server and isolated database. Exercise the actual UI for signup, tutor filtering/profile, booking/back navigation, checkout/dashboard/reload/cancellation, invalid forms and login, library/download/completion, quizzes/progress/goals, packages, forum/replies, assistant sources, messages, session notes/whiteboard and legacy links. Visit every screen at desktop and narrow mobile widths; fail on uncaught JS exceptions, failed local asset requests, horizontal overflow, and major axe accessibility violations. Inspect screenshots, including reduced-motion/mobile navigation. Pin test tooling in package-lock and supply CI plus reproducible commands.

Self-review risks: do not accept client prices, stale grades, offline bookings without schedule, duplicate slots, other users' IDs, client quiz scores, fake paid state, fabricated reviews, or unsupported AI claims. Use test clocks for completed sessions rather than a production bypass. Tests must use temporary storage and never reset user data.

Commit after the complete gate passes, grouped as planning/domain documentation; backend/session/booking foundation; responsive learner UI; learning/community tools; regression/CI/docs. Preserve truthful scope in documentation. Verify author/committer, clean status, and remote commit hash after push.
