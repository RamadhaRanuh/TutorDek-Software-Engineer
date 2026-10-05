# How do we repair the requested pages and improve tutor animation?

Label: wayfinder:task
Parent: [Finish TutorDek](../map.md)
Assignee: Rama Ranuh (agent executing the delegated repair)
Status: resolved
Blocks: none

## Request and decision

Improve automatic booking and the Guru Terbaik Kami animation; fix the package, ebook, promo, and testimonial interfaces. Keep the original standalone pages, artwork, fonts, copy, catalogue names/prices, and navigation. Group fragmented exported elements into real sections/cards within those documents and use scoped fluid layouts. The landing hero and its desktop coordinates stay intact.

## Evidence and repairs

The earlier overflow checks missed content hidden inside fixed containers. Rendered screenshots and `npx playwright test tests/browser/layout.spec.js --project=mobile` reproduced clipped promo artwork, overlapping audio actions, and a hidden original testimonial. The promo portrait extended 340px below its clipped frame. The generated testimonial text, author names, and card backgrounds occupied separate containers; mobile rules hid some fragments. These failures require actual content grouping and layout checks, beyond checking the document's scroll width.

`CSS/pages.css` controls the four repaired catalogues. The six package cards and six original story excerpts retain their source content; obsolete invisible exported button/background layers are removed. Package filters now match the cards' names: four UTBK packages, two Live Class packages, and two Siap Belajar packages. Ebook audio entries use independent rows with their own sample actions. Promo images and claim buttons remain inside their cards. Video controls explain their unconfigured state.

`CSS/booking.css` repairs the existing automatic form. Its five original steps now have a visible counter/current step, field labels, compatible tutor previews, selectable advertised WIB times, a 90-day date bound, and a readable checkout. Removing the old nested container backgrounds/blur also fixes hit testing after date selection. Server matching, availability, pricing, and persistence remain authoritative.

The original tutor strip now uses scroll snapping, measured pagination, keyboard navigation, smooth automatic movement while visible, and a pause/resume control. Hover, focus, hidden documents, active popups, and reduced-motion preferences suspend automatic movement. Original profile controls remain attached to their cards.

## Acceptance evidence

Regression coverage checks actual portrait containment, visible independent stories, text collisions between different text nodes, ordered sections, responsive widths, category/detail mapping, sample/claim/video actions, automatic form steps and date-to-time clicks, carousel playback/keyboard/reduced motion, and targeted accessibility. Wrapped line boxes from the same text node are excluded from collision detection because font metrics can overlap without overlapping text. Screenshots cover 320px, 390px, 768px, 1024px, and 1440px layouts. Full test and delivery results are recorded in [verification](../../../docs/verification.md).

This is the agent's implementation recommendation under the user's existing authorization, not a fabricated interview. No external services or replacement frontend are introduced.
