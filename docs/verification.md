# Verification of the restored TutorDek interface

Application behavior and service boundaries: [README](../README.md).

## Fidelity evidence

The active frontend is restored from `1226597`, with repairs in its original HTML/JavaScript and a separate CSS override sheet. The replacement `web/` SPA is removed. Root and original nested HTML URLs serve the original documents rather than redirecting to new screens.

The follow-up repairs regroup the package, ebook, promo, and testimonial fragments into sections/cards within their original standalone documents. Their source content, catalogue prices, fonts, and artwork remain. `CSS/pages.css` supplies fluid layouts; `CSS/booking.css` supplies automatic booking guidance. The original landing hero geometry remains covered by the existing assertions.

Compared against that commit, the generated `CSS/tugas-akhir.css`, `CSS/global.css`, `CSS/fiturOverlay.css`, and all four feature-page style sheets are unchanged after normalizing checkout line endings. Retained UI artwork is unchanged; unreferenced exports were removed during repository cleanup. Auth style changes remove network font imports; local copies of the original fonts replace them. Desktop browser assertions verify the original hero at x=0/y=96 with 1440×622 geometry, booking section y=718, promo section y=1496, hero photograph, eight tutor cards, and the original main stylesheet.

Desktop and mobile screenshots cover all ten original pages. The original 1440px landing screenshot was compared with the repaired rendering. The hero, art, cards, section order, and overall desktop composition remain. Mobile layouts adapt those same sections into document flow. Profile/feature popup screenshots were inspected after the final positioning repair, including after scrolling to tutor cards.

## Automated gate

- Python domain/HTTP tests cover account creation, password/token hashing, expiry/logout, Remember Me cookie persistence, CSRF/body bounds, static serving boundaries, original page routes, tutor/subject/topic/grade validation, future advertised WIB slots, offline requirements, simultaneous allocation, learner overlap, authoritative prices/promos, idempotent payment, cancellations, time-gated completion/unique reviews, ownership, restart persistence, sample learning/enrollment, quiz scoring, forum/replies, and sourced retrieval/history isolation.
- Browser tests load every original page on desktop and mobile with no duplicate IDs, missing images, failed asset requests, runtime exceptions, or horizontal page overflow. Interaction journeys cover original signup/login/logout, manual offline and automatic online bookings, stale-grade validation, notes/cancellation, package categories/prices/enrollment, reading/completion/quiz/progress targets, forum escaping/replies, sourced assistant explanations, promos, ebooks, material downloads, tutor messages, guest signup recovery, FAQ, carousels, and profile/Fitur popups.
- Layout checks include 320px, 390px, 768px, 1024px, and 1440px viewports. Reduced motion, keyboard activation, Tab trapping, Escape, focus restoration, and viewport bounds are checked.
- Follow-up checks verify actual promo portrait containment, all six visible testimonial cards and their authors, collisions between different text nodes, section order, package filter/detail mapping, ebook samples, every promo claim, and testimonial controls. Automatic booking checks cover five-step guidance, candidate previews, date-to-time-button clicks, and checkout. Tutor-strip checks exercise automatic advance, pause, pagination, keyboard navigation, and reduced motion.
- Axe checks critical/serious WCAG A/AA violations in the repaired signup form, learning dialog, four catalogue content areas, and automatic form. This is targeted automated evidence, not whole-site accessibility certification or a substitute for assistive-technology testing.
- Browser projects use separate disposable servers/databases; completion/review boundaries use a controlled backend test clock without a production shortcut.

## Findings corrected

Wrong active frontend and redirect behavior; missing script/style/image references; case-sensitive JavaScript paths; external font/Bootstrap reliance; duplicate field/profile IDs; empty field labels; signup/login redirect-only behavior; stale class choices; missing offline schedules; unvalidated time/payment selection; checkout that only alerted; unconfigured map scripts and exposed key; incomplete package filtering; idle search/FAQ/detail/feature/footer controls; invalid carousel indices; fixed-width mobile clipping; off-screen profile/feature popups; invisible profile names after duplicated ID repair; missing dialog keyboard/focus behavior; and actual data rendered through escaped text.

One initial Windows rerun reported a socket-abort error while checking a rejected request. The focused HTTP suite passed on recheck; final gate results below apply to the final worktree. No test retries are configured.

The follow-up initially reproduced a promo portrait extending 340px beyond its clipped frame, overlapping ebook audio actions, and a hidden testimonial. Grouping the corresponding fragments fixed those failures. Further checks corrected package category mapping and missing promo handlers. An actual date-then-time click exposed pointer interception by the old automatic-form container; removing its nested blur/background fixed it. Targeted contrast corrections passed the added axe checks. A test that reused hidden promo text was corrected to await each dialog's opening and closing explicitly, and both desktop/mobile action checks then passed. Screenshots were inspected at 320, 390, 768, 1024, and 1440px, including the full automatic checkout and its reachable finish button at 320px.

The oversized-upload HTTP check reproduced the earlier Windows socket race: the server rejects the declared size while the client is still sending the body. The regression now sends an oversized Content-Length without a body and verifies the 413 response and error text. This proves rejection before body consumption without racing an unread upload against connection closure. Application backend code is unchanged; all 27 backend checks passed with the corrected fixture.

## Initial restoration result

On 5 October 2026, the corrected `npm test` gate passed: **27 backend tests** and **50 browser tests** (25 desktop and 25 mobile; 3.1 minutes for the browser suite), with no configured retries. `npm run format:check`, `git diff --check`, and staged whitespace checks passed. The only edits after the behavior gate were whitespace cleanup and delivery documentation. The corrective history separates the amended specification, original-page restoration, account/booking logic, FAQ/carousel repairs, regression coverage, and delivery documentation. Author/committer identity, the final remote hash, and the exact pushed CI run are checked after push.

Real payments, recovery email, OAuth, proximity maps, real tutor delivery/video, licensed content, production scaling, other browser engines/physical devices, and model-backed RAG are not exercised. Their service states are explicit in the original UI and [startup documentation](../README.md). Reports, databases, dependencies, and generated screenshots are ignored by Git.

## Targeted UI follow-up result

On 5 October 2026, `npm run test:api` passed **27 backend tests** and `npm run test:ui` passed **74 browser tests** (37 desktop and 37 mobile; 6.0 minutes), without configured retries. These checks ran against the final behavior changes and corrected test fixtures. `npm run format:check` and `git diff --check` passed. Only delivery documentation changed after the final behavior checks.

The follow-up history separates the wayfinder decision, four catalogue repairs, automatic booking guidance, tutor-strip animation, regression coverage, and delivery documentation. All six commits use Rama Ranuh as author and committer, with no assistant co-author. Remote hash, clean worktree, and the exact pushed CI run are verified during delivery. The service boundaries above still apply.

## Repository cleanup

Planning scratch files, the standalone RAG notebook, obsolete MySQL schemas/diagrams, and the copied particles.js demo/source tree were removed. The active particle library and its MIT notice remain. A reference audit followed HTML resources, CSS URLs, script-created images, SVG links, and catalogue tutor photographs; it identified 63 UI exports with no active reference. Used assets and generated styles remain intact.

Manual and automatic booking now share `Javascript/booking.js`, preserving their mode-specific behavior. The unused combined script and popup handlers overwritten by `repairs.js` were removed, along with ebook carousel code and overrides for markup that no longer exists. HTTP fixtures now check active static files and traversal against the existing server source. README links and the frontend README were corrected; local scratch files are ignored.

The cleanup gate passed on 5 October 2026: `npm test` completed all 27 backend tests and 74 desktop/mobile browser tests (6.1 minutes for browsers), without retries. Formatting and whitespace checks passed. The reference audit reported no missing local resource paths or further unreferenced frontend files; dependency notices and generated styles were retained. Only documentation changed after the behavior gate. The cleanup is delivered through focused user-authored commits, with remote hash and CI checked after push.
