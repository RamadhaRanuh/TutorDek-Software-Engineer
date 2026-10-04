# TutorDek

TutorDek runs the project's original HTML, CSS, JavaScript, cards, and artwork with repaired account, booking, catalogue, and learning interactions. The original desktop composition remains; responsive overrides let the same pages work on smaller screens. The replacement SPA has been removed.

## Run locally

Requires **Python 3.10 or newer**. No Python packages, MySQL, API keys, or frontend build are required.

```sh
python server.py
```

Open **http://127.0.0.1:8000**. Use **Masuk → Daftar** to create an account. There are no shared default passwords. The account, bookings, notes, messages, lesson progress, quiz attempts, and forum activity persist in `data/tutordek.sqlite3`, which is ignored by Git. Stop the server before copying the database for backup.

```sh
python server.py --port 8080
python server.py --temporary --port 8001
```

`--temporary` uses disposable storage. `TUTORDEK_DB` selects a different database file. Opening the HTML directly or using a static-only server displays the design but does not supply the persistence API. Both the original nested page URLs and root-level filenames work; `/` serves `landing-page.html`.

## Use the original interface

- Original signup/sign-in forms validate and save accounts. Password visibility, Remember Me, useful errors, logout, and the signed-in **Akun Saya** button work.
- The original hero search finds tutors, subjects, packages, and sample materials. Tutor profiles open their original popups; **Pesan Sekarang** preselects the chosen tutor.
- Original manual/automatic booking pages keep their five steps. Grade/topic changes reset dependent choices. Both Online and Offline need a future WIB schedule; Offline also needs an address. Matching and server transactions prevent incompatible or overlapping reservations.
- Checkout previews rates and promos, saves a reservation, and confirms a demo payment. Guest selections survive signup. **Akun Saya** lists saved sessions and supports notes, cancellation, completion after the session ends, and one review per completed session.
- Original package filters/details keep the six cards and advertised prices. **Simpan koleksi demo** saves access to sample lessons; it does not activate a paid subscription. E-Book cards/category/audio controls open relevant samples, reading, browser narration, and text downloads.
- The original **Fitur** popup and feature tabs open lessons, completion, server-graded exercises/TryOut/BrainBoost, progress targets, saved outgoing tutor messages, forum questions/replies, and sourced Robot Tutor explanations.
- Original FAQ, profile/feature dialogs, promo claims, carousels, footer controls, keyboard activation, Escape/focus restoration, and reduced-motion behavior work. Bootstrap and the original fonts are bundled locally with their licenses.

## Service boundaries

Tutor profiles, qualifications, ratings, hourly rates, and availability are **demo data**. Saving a booking reserves a slot in this local application; actual tutor delivery is not connected. Automatic matching uses subject, school level, mode, rating, price, and availability. The original map area presents matching information; nearest-location maps need a configured map service.

Checkout is a **simulation**. No real money, card/account numbers, credentials, or refunds are processed. `BELAJAR20` gives a server-calculated 20% discount capped at Rp25,000 for tutoring demo bookings. Dates and times are **Asia/Jakarta (WIB, UTC+7)**. Select an advertised whole-hour slot in the future and within 90 days. A confirmed session can be completed after its scheduled end, then reviewed once by its owner.

The bundled lessons are original sample text, not licensed publisher books or a video library. Package and ebook prices remain part of the original catalogue design; paid subscriptions and purchases are not active. Audio samples use browser speech synthesis where available. Messages persist as outgoing records; tutor replies and live calls are not connected. Robot Tutor retrieves relevant bundled explanations and sources; it is not a generative model. Google login, recovery email, live video, payments, real tutor onboarding, and model-backed RAG need external services. Their existing controls explain these limits.

## Verify

Requires Node.js for development checks only.

```sh
npm ci
npx playwright install chromium
npm test
npm run format:check
```

On Linux, use `npx playwright install --with-deps chromium`. Python tests cover persistence, authentication, ownership, server validation, concurrency, pricing, and lifecycle boundaries. Browser tests operate the restored HTML pages on desktop/mobile, check original desktop geometry and artwork, inspect all page assets, and exercise original interactions. Separate temporary servers isolate desktop/mobile storage. Screenshots are generated under ignored `artifacts/original/`; failures retain Playwright traces. CI repeats the gate on Linux. See [verification](docs/verification.md) and the amended [wayfinder specification](.scratch/finish-tutordek/spec.md).

## Code map

| Path | Purpose |
| --- | --- |
| `TutorDek Software Engineer/TutorDek-Final-Project-main/*.html` | Active original pages, repaired in place |
| `CSS/`, `fitur/*.css` inside that directory | Original generated styles, preserved |
| `CSS/repairs.css` inside that directory | Responsive, popup, focus, and form overrides |
| `Javascript/`, `Sign-in fiture/`, `Sign-up fiture/` | Original interaction files plus service/action adapters |
| `public/`, `fitur/public/`, `vendor/` | Original artwork and bundled licensed fonts/Bootstrap |
| `server.py`, `tutordek/` | Local entrypoint, same-origin API, SQLite persistence, validation, sample content |
| `tests/` | Backend and restored-page browser regressions |
| `.scratch/finish-tutordek/` | Wayfinder decisions and corrected original-interface specification |
| `Personal-Chatbot_LLM_RAG/` | Separate exploratory notebook; not a runtime dependency |

The original MySQL references remain in the repository; the active local app uses SQLite. The development server serves only allowlisted frontend files and does not expose the repository or database. External production hosting is separate work; use HTTPS and an appropriate production server/reverse proxy, with `TUTORDEK_PUBLIC_HOST` and `TUTORDEK_SECURE_COOKIE=1` configured for that deployment.
