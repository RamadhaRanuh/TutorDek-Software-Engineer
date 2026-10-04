# How do we finish the project while keeping the user's original interface?

Label: wayfinder:task
Parent: [Finish TutorDek](../map.md)
Assignee: Rama Ranuh (agent executing the delegated repair)
Status: resolved
Blocks: none

## Question

Which implementation respects the user's correction to fix the previous code and retain its UI?

## Resolution

The replacement SPA introduced after `1226597` is the wrong interface. Restore the ten original HTML files and serve them directly at both root and existing nested URLs. Keep their generated CSS, illustrations, hero, navigation, cards, and desktop coordinates. Replace only broken interaction logic; layer layout repairs for smaller viewports. Account forms and the five-step booking flows retain their original controls and connect to the existing Python/SQLite API.

Complete learning tools in popups opened by the existing Fitur and detail controls, using the original blue/orange palette and popup shapes. Preserve the six advertised package cards and prices; explicitly distinguish sample collection enrollment from paid subscriptions. Keep the original map container but state that nearest-location matching is unavailable without a configured map service, and implement availability-based automatic selection instead. Remove exposed map keys from active code. Keep payment, video, email recovery, Google login, and local retrieval service limits visible where they matter.

Regression evidence must include a server test asserting the original root page markup, original desktop geometry/artwork assertions, all ten pages loading without missing assets or runtime errors, mobile layouts without clipping or unreachable controls, account and booking persistence, and learning/forum journeys through original controls. See the amended [specification](../spec.md).

This is the agent's recommendation in response to the user's explicit correction, not a fabricated interview.
