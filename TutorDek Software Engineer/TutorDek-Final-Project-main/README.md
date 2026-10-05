# Original TutorDek project

This directory contains the active standalone HTML pages, generated styles, interaction scripts, artwork, and local dependencies. Run the application from the repository root:

```sh
python server.py
```

Open http://127.0.0.1:8000. Both root and nested HTML entrypoints serve these pages directly. Manual and automatic booking share `Javascript/booking.js`; account, catalogue, and learning actions use the same-origin API.

The active schema is `../../tutordek/schema.sql` (SQLite). The active app uses owned records, full-size rates/ratings, random IDs and transactional booking allocation. Obsolete MySQL references and unused exports have been removed. Dependency licenses, including the particles.js MIT notice, are in `vendor/`.

See the [root README](../../README.md) for features, boundaries and tests.
