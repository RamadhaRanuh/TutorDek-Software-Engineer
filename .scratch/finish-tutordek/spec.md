# TutorDek completion specification

Status: ready-for-agent
Source: [Finish TutorDek: a working learning journey](map.md)

## Problem and outcome

The original pages describe a tutoring product but do not maintain accounts, reservations, or learning activity. Build a single locally runnable app that connects the advertised learner-facing features and survives reloads and server restarts. Decisions and evidence live in the map's child tickets.

## Acceptance criteria

1. `python server.py` serves the app and creates its SQLite database without application dependencies. The existing nested HTML URLs redirect to corresponding working screens. Original assets, SQL and RAG reference work remain available in the repo.
2. Signup/login/logout use hashed passwords and protected expiring cookie sessions. Server validation, bounded requests, same-origin mutation checks, and ownership prevent malformed or cross-account changes. No credentials appear in responses or Git.
3. Learners filter demo tutors by subject, school level, mode, rate, rating and date/slot, read profiles, and reserve manually or automatically. Grades/topics stay compatible with their parent selection. Booking requires a future whole-hour advertised slot within 90 days for online and offline; offline also requires an address.
4. Server transactions prevent duplicate/overlapping tutor slots and learner slots. Server prices/promos determine the total. Pending bookings can receive one idempotent simulated payment; cancellation and time-gated completion obey legal transitions. Unique reviews attach only to completed bookings.
5. A dashboard lists real saved activity, sessions and statuses; users can save booking notes, export a whiteboard, and send persistent outgoing messages without fabricated replies.
6. Bundled original lessons support reading, completion, printable/downloadable ebooks. Packages persist enrollment. BrainBoost and tryout use server-scored questions and saved attempts. Progress summarizes genuine completions/scores and goals.
7. A grounded assistant returns sourced material or a clear unsupported-question response. Forum posts/replies persist and safely render user text. Testimonials use saved booking reviews; promos show usable codes and clear simulation terms.
8. Every screen works with keyboard, narrow mobile and desktop layouts. Navigation, dialogs, forms, status messages, focus, FAQ, animation and reduced-motion preferences work. Routes have loading/error/empty states and back/reload behavior.
9. Backend and Playwright regression suites pass against isolated storage; axe and layout checks pass; screenshots are inspected. CI reproduces the gate. Documentation gives startup/test commands and precise external-service limits.
10. Produce focused logical commits under the user's configured author and committer identity, with no assistant authorship. Push normally and verify the remote branch hash.

## Self-assessment

The recommendation covers all learner-facing areas named by the README while separating infrastructure-dependent capabilities. Scope is complete for a local demonstration application, not a production tutoring business: tutor data and checkout are demonstrations; the assistant is grounded retrieval; the study room provides notes/drawing rather than video transport. Account recovery, tutor/admin portals, actual payments, live video and model-backed RAG require separate infrastructure-backed work. Avoid nonfunctional CTAs for those capabilities. Atomic booking allocation, private-data isolation, malformed input, real-time boundaries, truthful UI, and persistence receive explicit tests.

## Technical references

- [Python sqlite3 transaction and connection behavior](https://docs.python.org/3.12/library/sqlite3.html): explicitly close connections and use transactions around multi-step writes.
- [Playwright webServer](https://playwright.dev/docs/test-webserver): start the isolated app server under the browser test runner.
