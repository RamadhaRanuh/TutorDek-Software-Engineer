# Original TutorDek project

This directory preserves artwork, historical generated CSS/JavaScript, MySQL exports and the ERD. Run the application from the repository root:

```sh
python server.py
```

Open http://127.0.0.1:8000. Existing HTML entrypoints redirect to working routes. Historical scripts and styles are not loaded by the new app.

The active schema is `../../tutordek/schema.sql` (SQLite). `QueryTutorDek.sql` and `ExportDBTutorDek.sql` are historical MySQL references, not app setup scripts. The old profile ID triggers disagree with user foreign keys, rating precision is insufficient, and MAX-based ID allocation is unsafe under concurrency. The active app uses compatible ownership, full-size rates/ratings, random IDs and transactional booking allocation.

See the [root README](../../README.md) for features, boundaries and tests.
