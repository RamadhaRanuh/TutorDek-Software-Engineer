# Verification of the restored TutorDek interface

Specification: [repair the original interface](../.scratch/finish-tutordek/spec.md).

## Fidelity evidence

The active frontend is restored from `1226597`, with repairs in its original HTML/JavaScript and a separate CSS override sheet. The replacement `web/` SPA is removed. Root and original nested HTML URLs serve the original documents rather than redirecting to new screens.

Compared against that commit, the generated `CSS/tugas-akhir.css`, `CSS/global.css`, `CSS/fiturOverlay.css`, and all four feature-page style sheets are unchanged after normalizing checkout line endings. Original artwork is unchanged. Auth style changes remove network font imports; local copies of the original fonts replace them. Desktop browser assertions verify the original hero at x=0/y=96 with 1440×622 geometry, booking section y=718, promo section y=1496, hero photograph, eight tutor cards, and the original main stylesheet.

Desktop and mobile screenshots cover all ten original pages. The original 1440px landing screenshot was compared with the repaired rendering. The hero, art, cards, section order, and overall desktop composition remain. Mobile layouts adapt those same sections into document flow. Profile/feature popup screenshots were inspected after the final positioning repair, including after scrolling to tutor cards.

## Automated gate

- Python domain/HTTP tests cover account creation, password/token hashing, expiry/logout, Remember Me cookie persistence, CSRF/body bounds, static serving boundaries, original page routes, tutor/subject/topic/grade validation, future advertised WIB slots, offline requirements, simultaneous allocation, learner overlap, authoritative prices/promos, idempotent payment, cancellations, time-gated completion/unique reviews, ownership, restart persistence, sample learning/enrollment, quiz scoring, forum/replies, and sourced retrieval/history isolation.
- Browser tests load every original page on desktop and mobile with no duplicate IDs, missing images, failed asset requests, runtime exceptions, or horizontal page overflow. Interaction journeys cover original signup/login/logout, manual offline and automatic online bookings, stale-grade validation, notes/cancellation, package categories/prices/enrollment, reading/completion/quiz/progress targets, forum escaping/replies, sourced assistant explanations, promos, ebooks, material downloads, tutor messages, guest signup recovery, FAQ, carousels, and profile/Fitur popups.
- Layout checks include 320px, 390px, 768px, 1024px, and 1440px viewports. Reduced motion, keyboard activation, Tab trapping, Escape, focus restoration, and viewport bounds are checked.
- Axe checks critical/serious WCAG A/AA violations in the repaired signup form and learning dialog. This is targeted automated evidence, not whole-site accessibility certification or a substitute for assistive-technology testing.
- Browser projects use separate disposable servers/databases; completion/review boundaries use a controlled backend test clock without a production shortcut.

## Findings corrected

Wrong active frontend and redirect behavior; missing script/style/image references; case-sensitive JavaScript paths; external font/Bootstrap reliance; duplicate field/profile IDs; empty field labels; signup/login redirect-only behavior; stale class choices; missing offline schedules; unvalidated time/payment selection; checkout that only alerted; unconfigured map scripts and exposed key; incomplete package filtering; idle search/FAQ/detail/feature/footer controls; invalid carousel indices; fixed-width mobile clipping; off-screen profile/feature popups; invisible profile names after duplicated ID repair; missing dialog keyboard/focus behavior; and actual data rendered through escaped text.

One initial Windows rerun reported a socket-abort error while checking a rejected request. The focused HTTP suite passed on recheck; final gate results below apply to the final worktree. No test retries are configured.

## Final result

On 5 October 2026, the corrected `npm test` gate passed: **27 backend tests** and **50 browser tests** (25 desktop and 25 mobile; 3.1 minutes for the browser suite), with no configured retries. `npm run format:check`, `git diff --check`, and staged whitespace checks passed. The only edits after the behavior gate were whitespace cleanup and delivery documentation. The corrective history separates the amended specification, original-page restoration, account/booking logic, FAQ/carousel repairs, regression coverage, and delivery documentation. Author/committer identity, the final remote hash, and the exact pushed CI run are checked after push.

Real payments, recovery email, OAuth, proximity maps, real tutor delivery/video, licensed content, production scaling, other browser engines/physical devices, and model-backed RAG are not exercised. Their service states are explicit in the original UI and [startup documentation](../README.md). Reports, databases, dependencies, and generated screenshots are ignored by Git.
