# How should accounts and tutoring sessions persist safely?

Type: grilling
Label: wayfinder:grilling
Status: resolved
Assignee: Rama Ranuh
Parent: ../map.md
Blocked by: 01

## Question

What runtime, authentication, booking lifecycle, pricing, schedule validation, ownership, and persistence model make the learner journey functional without third-party credentials?

## Answer

Use Python 3.10+ standard library HTTP server and SQLite, requiring no application package installs or MySQL setup. Keep domain services separate from HTTP and content. SQLite transactions serialize booking allocation and enforce ownership. Runtime data lives in ignored `data/`, configurable for isolated tests; restarting preserves all learner state.

Passwords use PBKDF2-HMAC-SHA256 with per-account random salts; session tokens are random, stored as hashes, expire after seven days, and travel in HttpOnly/SameSite cookies. Mutation requests require same-origin validation and a custom JSON header. Bound request size and field lengths; parameterize SQL; validate types; limit authentication attempts; serve only an explicit frontend/asset allowlist.

Bookings last one hour, use Asia/Jakarta (UTC+7) explicitly, and require a future date within 90 days, an advertised whole-hour slot, a supported grade/subject/topic, tutor compatibility, and an address for offline sessions. Automatically match only tutors available for the selected slot and mode. Reject overlapping reservations atomically; calculate authoritative prices and discounts on the server. A booking progresses pending -> confirmed -> completed, or pending/confirmed -> cancelled. Only simulated payment confirms it; repeated confirmation is idempotent. Completion requires the session end to have passed. Reviews require a completed owned booking and are unique per booking. No payment/card details are collected.

Account data, bookings, messages, notes, exercise results, goals, enrollments, and reviews are isolated by authenticated ownership. Public forum posts and reviews expose display names, never credentials or emails. Use a same-origin app shell and explicit legacy redirects.
