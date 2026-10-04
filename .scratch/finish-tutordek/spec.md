# TutorDek completion specification: repair the original interface

Status: implementation under verification
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

## Implementation evidence

Pending the corrected acceptance gate. The earlier 26 API/14 SPA browser results do not verify this restored interface. Updated results will be recorded in [verification](../../docs/verification.md).
