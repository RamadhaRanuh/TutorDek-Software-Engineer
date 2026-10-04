# TutorDek

TutorDek is a runnable Indonesian tutoring and learning application. Create a learner account, find a tutor, book a one-hour session, and keep your learning activity in one place.

## Run locally

Requires **Python 3.10 or newer**. No Python packages, MySQL, API keys, or frontend build are needed.

```sh
python server.py
```

Open **http://127.0.0.1:8000**. Create an account through **Daftar**; there are no shared default passwords. Your account, sessions, bookings, messages, notes, and progress persist in `data/tutordek.sqlite3`. This directory is ignored by Git. Back up the database with the server stopped.

```sh
python server.py --port 8080
python server.py --temporary --port 8001
```

`--temporary` runs an isolated demonstration without modifying saved data. `TUTORDEK_DB` selects a different database file. Opening HTML files directly or using a static-only server does not provide the app's API.

## Working features

- Accounts: registration, login, logout, expiring protected sessions, server validation and hashed passwords.
- Tutor discovery: name, subject, school level, mode, price, rating and date/slot filtering; tutor profiles; manual or automatic matching.
- Booking: dependent grade/topic choices, online/offline sessions, WIB scheduling, address validation, atomic conflict prevention, server pricing, promos, simulated checkout, cancellation and completion.
- Dashboard and study room: saved sessions, statuses, notes, local whiteboard with PNG export, and persistent outgoing messages.
- Learning: nine original text lessons, printable/downloadable HTML ebooks, three free study packages, BrainBoost and an 18-question tryout with server scoring, saved results, completions and goals.
- Community: forum questions, replies and reviews linked to completed bookings.
- Learning assistant: retrieves explanations from bundled lessons, links sources, and saves history.
- Interface: Indonesian copy, desktop/mobile layouts, keyboard navigation, native dialogs and FAQ, loading/error/empty states, visible focus and reduced motion.

## Demonstration boundaries

Tutor profiles, qualifications, ratings, rates and hourly availability are **demo data**, based on the original catalogue. A booking reserves a slot inside this application, not a real tutor. Automatic matching selects a compatible available tutor by demo rating, then price.

Checkout is a **simulation**: no real money, card numbers, bank credentials or refunds are processed. `BELAJAR20` applies a server-calculated 20% discount, capped at Rp25,000. All dates and times use **Asia/Jakarta (WIB, UTC+7)**. Reservations must be in the future and within 90 days. A confirmed session can be completed only after its scheduled end; then its owner can leave one review.

The study room supplies notes and a drawing board; it does **not** provide video/audio conferencing or multiplayer drawing. Outgoing messages persist, but no tutor account or synthetic reply is provided. Whiteboard drawings stay in the browser until downloaded. The assistant is **material retrieval, not an LLM**. Content is original sample text, not licensed publisher ebooks or a video library. The old paid subscription mockups are replaced with free self-study collections; tutoring is booked separately.

Production payments, email/password recovery, verified tutor onboarding, tutor/admin portals, live video, production deployment, and model-backed RAG require additional infrastructure and are outside this local completion effort. No nonworking controls promise those services.

## Tests

Backend tests need only Python:

```sh
python -m unittest discover -s tests -p "test_*.py" -v
```

Browser tests require **Node.js 20+**:

```sh
npm ci
npx playwright install chromium
npm test
```

Playwright starts a temporary database/server on port 8765, runs desktop Chromium and mobile Chromium emulation, and stops the server when finished. Tests cover user journeys, escaped content, downloads, persistence, layout overflow, reduced motion and axe accessibility rules. Python checks also exercise simultaneous reservations, account isolation, malformed requests, pricing, state transitions, expiry and server-scored exercises.

Reports and screenshots in `playwright-report/`, `test-results/`, and `artifacts/` are ignored. [Verification notes](docs/verification.md) record the evidence. GitHub Actions runs the same tests on Linux. Mobile emulation does not substitute for physical-device or Safari/Firefox testing.

## Project structure

| Path | Purpose |
| --- | --- |
| `server.py` | App entrypoint |
| `tutordek/service.py` | Validated domain operations and persistence |
| `tutordek/http.py` | Same-origin JSON API and allowlisted static serving |
| `tutordek/schema.sql` | Active SQLite schema |
| `tutordek/content.py` | Original lessons and demo catalogue |
| `web/` | App shell, route modules and responsive styles |
| `tests/` | Isolated backend and browser tests |
| `.scratch/finish-tutordek/` | Wayfinder map, resolutions and reviewed spec |
| `GLOSSARY.md` | Domain vocabulary |
| `TutorDek Software Engineer/TutorDek-Final-Project-main/` | Original assets, historical CSS/JS, MySQL references and legacy URLs |
| `Personal-Chatbot_LLM_RAG/` | Separate exploratory RAG notebook; not an app dependency |

Original HTML URLs redirect to current screens, including both booking flows. Old generated CSS/JS and MySQL dumps are historical references and are not loaded by the application. Their schema shortcomings and migration boundaries are documented in the [wayfinder audit](.scratch/finish-tutordek/issues/01-completion-boundary.md).

The Python HTTP server is intended for local development and demonstration. For external hosting, use an appropriate production server/reverse proxy with HTTPS, set `TUTORDEK_PUBLIC_HOST` to the public host (including a nondefault port if applicable) and `TUTORDEK_SECURE_COOKIE=1`, and perform a deployment review. Avoid exposing the repository or database through another static server.
