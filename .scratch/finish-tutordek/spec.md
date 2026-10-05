# TutorDek completion specification: repair the original interface

Status: implemented and verified locally; remote delivery checked after push
Source: [Finish TutorDek](map.md) and [the original-interface correction](issues/05-original-interface.md)

## Problem and outcome

The previous implementation replaced the original pages with a new SPA. The user explicitly rejected that approach. Restore and repair the code at `1226597` so the UI looks like the user's original project, with working account, booking, catalogue, and learning interactions. Preserve the desktop composition; repair mobile positioning with overrides on the same elements.

## Acceptance criteria

1. `python server.py` serves the original ten HTML pages at root and existing nested paths. `/` renders the original landing page. Remove the replacement `web/` SPA and its redirect route behavior. Preserve the original generated CSS, illustrations, hero, cards, SQL reference, and separate RAG work.
2. Original signup/sign-in forms save accounts through the existing API with hashed passwords, protected expiring cookies, useful inline errors, and a password visibility toggle. Masuk opens sign-in; signed-in navigation opens the account popup and supports logout. Google login and password recovery explain their unconfigured service state.
3. Repair the original five-step manual and automatic booking pages. Reset dependent selections, preserve English tutor card names, show compatible tutors and their prices, require a future whole-hour advertised schedule within 90 days, and require an offline address. Automatic matching uses subject, level, mode, and availability; do not claim proximity without a map service.
4. Preview prices and promo terms, then save a booking and apply an idempotent demo payment. Show a saved confirmation and session list, notes, cancellation, time-gated completion, and unique reviews. Server-owned totals, ownership checks, and atomic conflicts remain authoritative. Do not collect real payment account/card numbers.
5. Original search, FAQ, promo, profile, carousel, feature tabs, footer actions, package filters/details, and ebook controls perform useful actions. Keep the six original package cards, prices, and art; sample enrollment does not activate a paid subscription. Publisher books and videos need licensed content; bundled sample materials remain honest and usable.
6. Existing Fitur/detail controls open reading, completion, quiz/tryout/BrainBoost, progress/target tracking, local Robot Tutor retrieval, persistent messages, and forum creation/replies in popups styled to match the original project. No fabricated replies, live video, or generative-model claims. Escape, focus restoration, tab trapping, keyboard activation, and text escaping work.
7. Desktop 1440px hero and section geometry retain the original composition. Original pages work at mobile widths, with readable document flow, no horizontal page clipping, accessible form labels, reachable controls, and reduced-motion support. Assets and original fonts load locally; repair casing, missing assets, duplicate IDs, malformed fields, and exposed map keys.
8. Run isolated backend and browser tests through these original controls. Assert original root markup and desktop geometry/artwork; smoke-test all ten pages on desktop/mobile; inspect screenshots; verify account/booking/learning/community persistence and failure paths. Check accessibility of repaired forms/dialogs and keyboard behavior without claiming whole-site WCAG certification.
9. Update startup, service-limit, and verification documentation. Create focused corrective commits with Rama Ranuh as author and committer, without assistant co-authorship, push normally, and verify remote hash and CI.

## Self-assessment

The original-interface constraint is an acceptance requirement, not a color palette preference. Preserving the exact original generated desktop style sheets and markup while repairing behavior and adding scoped responsive rules is the recommended approach. The Python/SQLite backend can remain behind that UI because it adds persistence without replacing the frontend. External payments, maps/proximity, OAuth, recovery email, real tutor delivery/video, licensed content, and model-backed RAG remain integration work; show honest states at their existing controls. Agent recommendations were explicitly delegated; this is not a fabricated grilling interview.

## Follow-up: requested page and animation improvements

The user's next request targets automatic booking, Guru Terbaik Kami, and the four catalogue pages. [Decision 06](issues/06-targeted-ui-improvements.md) extends the original-interface repair:

- Keep the original standalone HTML routes, source artwork/fonts, package names/prices, and learner API. Group exported fragments into responsive sections and cards inside those pages; preserve the landing hero geometry.
- Automatic booking keeps all five steps and saving behavior, with visible step guidance, compatible tutor previews, field labels, advertised time buttons, a 90-day calendar bound, and a readable confirmation. Date selection followed by a time-button click must work.
- Animate the original tutor strip smoothly with accurate pagination, native touch scrolling, keyboard controls, pause/resume, and automatic suspension for hover/focus/hidden pages/popups/reduced motion.
- Render all six original packages and all six story cards without fragment loss. Package filters reflect the actual card categories. Ebook text, audio rows, and sample actions remain independent; promo artwork/claim buttons remain visible; testimonial/video actions work with honest service states.
- Verify portrait containment, different-node text collisions, section order, viewport bounds, actions, and targeted accessibility on desktop/mobile, including the intermediate catalogue widths. Inspect rendered screenshots and run the full learner-journey gate before focused user-authored commits and push.

Follow-up evidence: 27 backend tests and all 74 browser tests passed on 5 October 2026, without configured retries. Formatting and whitespace checks passed; screenshots were inspected, including the complete 320px checkout. Application backend code and original artwork/generated styles remain unchanged. The oversized-upload test now verifies header rejection before sending a body, removing its Windows socket race. Delivery uses six focused user-authored commits with remote hash and CI checked after push.

## Initial restoration evidence

The corrected acceptance gate passed on 5 October 2026: 27 backend tests, 50 desktop/mobile browser tests, formatting, and whitespace checks. Original page and popup screenshots were inspected. See [verification](../../docs/verification.md) for scope and limitations. The final corrective commit chain is pushed normally and its author/committer identity, remote hash, and CI result are checked during delivery.
