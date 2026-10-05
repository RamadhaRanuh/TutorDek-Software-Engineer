# Finish TutorDek: a working learning journey

Label: wayfinder:map
Status: decisions resolved; original-interface implementation verified

## Destination

A locally runnable TutorDek application repaired in its original HTML, CSS, JavaScript, and artwork. Preserve the original desktop design while completing its account, booking, catalogue, and learning interactions, fixing mobile layouts, testing, and pushing focused user-authored commits.

## Notes

- Use wayfinder, grilling, and domain-modeling. The user explicitly delegates recommendations and asks for implementation, testing, commits, and push in the same effort. This overrides the default planning-only, live-interview, one-ticket-per-session, and stop-after-charting rules. Recommendations are agent decisions, not fabricated user interview answers.
- No issue tracker configuration exists. Use the skill's local Markdown fallback; each decision has its own child file. A setup command is unnecessary for this authorized local fallback.
- Claim each ticket before resolving it; record dependencies, answers, and evidence in its file. Link resolutions here by title.
- The user's correction supersedes the previous interface recommendation: restore the code from `1226597`, repair it in place, and remove the replacement SPA. Preserving only colors and assets is insufficient. Keep the actual page structures, hero composition, cards, art, and original style sheets. Scope responsive and accessibility overrides to their existing elements.
- Git author and committer use the existing user identity: Rama Ranuh <ramadha.ranuh@gmail.com>. No assistant co-author trailer.
- Verification must exercise the original HTML pages. The restoration passed 27 backend and 50 browser tests; the targeted UI follow-up passed 27 backend and 74 desktop/mobile browser tests, with inspected page/popup screenshots. See [verification](../../docs/verification.md).

## Decisions so far

- [What constitutes a complete runnable TutorDek?](issues/01-completion-boundary.md): Complete the persistent learner journey and learning tools with explicit external-service boundaries.
- [How should accounts and tutoring sessions persist safely?](issues/02-persistent-learning-journey.md): Python/SQLite with protected sessions, owned records, authoritative pricing, and atomic schedule allocation.
- [How should every learning screen behave on desktop and mobile?](issues/03-interface-and-learning-tools.md): Responsive Indonesian screens with persistent learning tools, accessible controls, and honest service states.
- [What evidence proves the project is ready to commit and push?](issues/04-verification-and-delivery.md): Isolated backend/browser checks, mobile/accessibility inspection, and a verified user-authored commit chain.
- [How do we finish the project while keeping the user's original interface?](issues/05-original-interface.md): Serve and repair the original ten HTML pages; retain persistent services behind their original controls and verify desktop composition against the original source.
- [How do we repair the requested pages and improve tutor animation?](issues/06-targeted-ui-improvements.md): Repair fragmented catalogue layouts in their original HTML pages, improve automatic booking guidance, and add controlled animation to the existing tutor strip.

## Not yet specified

None. All decision tickets are resolved. Implementation acceptance criteria live in [the reviewed specification](spec.md).

## Out of scope

- Provisioning payment merchants, email delivery, video infrastructure, production hosting, and downloading multi-gigabyte LLM weights. These need external accounts or infrastructure; supported local alternatives and their limitations must be explicit.
