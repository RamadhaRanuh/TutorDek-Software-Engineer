# What constitutes a complete runnable TutorDek?

Type: grilling
Label: wayfinder:grilling
Status: resolved
Assignee: Rama Ranuh
Parent: ../map.md
Blocked by: none

## Question

Which advertised capabilities are missing, and which can be completed autonomously with the repository and installed tools?

## Answer

The repository is a static semester project with no application server. Auth forms redirect without account storage; booking ends in alert/redirect; seven feature tabs change copy only. Existing SQL describes users, tutors, bookings, reviews, messages, and chatbot interactions but is unconnected. Every `JavaScript` reference disagrees with the actual `Javascript` directory; booking CSS/scripts and a promo asset are missing. Main layouts use fixed 1440px and extensive absolute positioning without responsive or reduced-motion rules. The RAG notebook requires missing local model/PDF artifacts and is exploratory, not a server.

Recommendation adopted under the user's explicit delegation: complete the learner journey with persistent accounts, searchable tutor profiles, manual/automatic tutor selection, validated online/offline booking, simulated checkout, dashboard, cancellation, session notes/whiteboard, messages, original reading materials, packages, exercises, progress/goals, grounded learning assistant, forum and booking-linked reviews. Keep tutor listings clearly identified as demonstration data. Preserve original source assets and reference SQL/notebook; route old URLs to working screens.

External payment, video, email, and model infrastructure remain deployment work. The product must identify simulation and self-study boundaries precisely and avoid claims of live AI or live video.

Further audit evidence: historical profile triggers generate STD/TCH/ADM keys that cannot match their USR foreign keys; DECIMAL(2,2) cannot store ratings like 4.8; global subject-name uniqueness prevents grade-specific subjects; MAX-based IDs race. The app replaces these with its active SQLite schema, while preserving the MySQL files as documented historical references. Original paid package mockups have no materials/entitlements and inconsistent prices (six months and one year both Rp229,000). Replace them with free original self-study collections, not unsupported paid subscription claims. Publisher ebook examples are not redistributed.
