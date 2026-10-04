PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 password TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
 token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), tutor_id TEXT NOT NULL,
 level TEXT NOT NULL, grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 12),
 subject TEXT NOT NULL, topic TEXT NOT NULL, mode TEXT NOT NULL CHECK(mode IN ('Online','Offline')),
 address TEXT NOT NULL DEFAULT '', start INTEGER NOT NULL, end INTEGER NOT NULL,
 status TEXT NOT NULL CHECK(status IN ('pending','confirmed','completed','cancelled')),
 price INTEGER NOT NULL CHECK(price >= 0), discount INTEGER NOT NULL CHECK(discount >= 0),
 total INTEGER NOT NULL CHECK(total >= 0), promo TEXT NOT NULL DEFAULT '',
 notes TEXT NOT NULL DEFAULT '', created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS tutor_schedule ON bookings(tutor_id, start, end, status);
CREATE INDEX IF NOT EXISTS learner_schedule ON bookings(user_id, start, end, status);
CREATE TABLE IF NOT EXISTS payments (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id), method TEXT NOT NULL,
 amount INTEGER NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS messages (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), tutor_id TEXT NOT NULL,
 body TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS completions (
 user_id TEXT NOT NULL REFERENCES users(id), lesson_id TEXT NOT NULL, created INTEGER NOT NULL,
 PRIMARY KEY(user_id, lesson_id)
);
CREATE TABLE IF NOT EXISTS attempts (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), quiz_id TEXT NOT NULL,
 score INTEGER NOT NULL, total INTEGER NOT NULL, correct INTEGER NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS goals (
 user_id TEXT PRIMARY KEY REFERENCES users(id), target INTEGER NOT NULL CHECK(target BETWEEN 1 AND 100)
);
CREATE TABLE IF NOT EXISTS enrollments (
 user_id TEXT NOT NULL REFERENCES users(id), package_id TEXT NOT NULL, created INTEGER NOT NULL,
 PRIMARY KEY(user_id, package_id)
);
CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), title TEXT NOT NULL,
 body TEXT NOT NULL, subject TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS replies (
 id TEXT PRIMARY KEY, post_id TEXT NOT NULL REFERENCES posts(id), user_id TEXT NOT NULL REFERENCES users(id),
 body TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS reviews (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id), user_id TEXT NOT NULL REFERENCES users(id),
 tutor_id TEXT NOT NULL, rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
 body TEXT NOT NULL, created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS assistant_history (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), question TEXT NOT NULL,
 answer TEXT NOT NULL, sources TEXT NOT NULL, created INTEGER NOT NULL
);
PRAGMA user_version = 1;
