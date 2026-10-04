# How should every learning screen behave on desktop and mobile?

Type: grilling
Label: wayfinder:grilling
Status: resolved
Assignee: Rama Ranuh
Parent: ../map.md
Blocked by: 01, 02

## Question

What accessible navigation, tutor discovery, booking wizard, learning library, exercises, assistant, progress, forum, messaging, and session workspace replace the disconnected mockups?

## Answer

Keep Indonesian copy, navy blue/orange colors, and original tutor/hero assets. Use semantic landmarks, a mobile navigation toggle, keyboard-operable links/buttons/forms/details, visible focus, labeled fields, live validation messages, native dialogs, and motion that respects prefers-reduced-motion. Replace fixed-position canvases with fluid grids. Provide loading, empty, error, success, and retry states. User content must be escaped before rendering.

Screens: home, tutor finder/profile, signup/login, four-step booking (learning needs; tutor/mode; schedule; review), dashboard, study room, messages, library/lesson, packages, promos, BrainBoost/tryout, progress/goals, learning assistant, forum/thread, and testimonials. Hash routes permit reload/back navigation without a build tool. Preserve safe return routes after authentication.

Search filters subject, level, mode, price, availability, and rating; matching uses these constraints rather than random map markers. Booking dependencies reset invalid downstream selections while back navigation preserves valid fields. The dashboard offers simulation payment, cancellation confirmation, completion after session end, and booking-linked reviews. Session notes persist; the whiteboard is a local drawing tool with PNG export. Messages are saved outgoing messages, with no fake tutor replies.

Original text lessons can be read, marked complete, printed, and downloaded as ebooks. Packages organize existing materials and persist enrollment. Practice/tryout questions are scored by the server and record progress; lesson completions drive goals. The assistant retrieves related bundled material and links sources; unsupported questions return a clear limitation. Forum questions/replies persist. Promos have explicit terms and server validation; testimonials consist of real saved reviews or an empty state.
