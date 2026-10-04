"""Validated domain operations. Every connection is short lived; writes are atomic."""

from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
from pathlib import Path
import re
import secrets
import sqlite3
import time

from .content import LESSONS, PACKAGES, PROMOS, SUBJECTS, TUTORS, public_lesson, quiz_questions

WIB = timezone(timedelta(hours=7))
GRADES = {"SD": range(1, 7), "SMP": range(7, 10), "SMA": range(10, 13)}


class Problem(Exception):
    def __init__(self, message, status=400):
        super().__init__(message)
        self.status = status


def text(data, key, minimum=1, maximum=200):
    value = data.get(key)
    if not isinstance(value, str) or not minimum <= len(value.strip()) <= maximum:
        raise Problem(f"Isi {key} dengan {minimum}–{maximum} karakter.")
    return value.strip()


def integer(data, key, low, high):
    value = data.get(key)
    if type(value) is not int or not low <= value <= high:
        raise Problem(f"Nilai {key} harus antara {low} dan {high}.")
    return value


def password_hash(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 600000).hex()
    return f"{salt}${digest}"


class Service:
    def __init__(self, path, clock=time.time):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.clock = clock
        with self.db() as db:
            db.executescript(Path(__file__).with_name("schema.sql").read_text())

    @contextmanager
    def db(self, write=False):
        connection = sqlite3.connect(self.path, timeout=15)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys = ON")
        try:
            if write:
                connection.execute("BEGIN IMMEDIATE")
            yield connection
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def now(self):
        return int(self.clock())

    def session(self, user_id, db):
        token = secrets.token_urlsafe(32)
        db.execute("DELETE FROM sessions WHERE expires <= ?", (self.now(),))
        db.execute("INSERT INTO sessions VALUES (?,?,?)", (hashlib.sha256(token.encode()).hexdigest(), user_id, self.now() + 604800))
        return token

    def signup(self, data):
        name = text(data, "name", 2, 80)
        email = text(data, "email", 3, 254).lower()
        password = data.get("password")
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            raise Problem("Alamat email tidak valid.")
        if not isinstance(password, str) or not 10 <= len(password) <= 128 or not password.strip():
            raise Problem("Gunakan kata sandi 10–128 karakter.")
        hashed = password_hash(password)
        user_id = secrets.token_hex(12)
        try:
            with self.db(True) as db:
                db.execute("INSERT INTO users VALUES (?,?,?,?,?)", (user_id, name, email, hashed, self.now()))
                token = self.session(user_id, db)
        except sqlite3.IntegrityError:
            raise Problem("Email sudah terdaftar. Silakan masuk.", 409) from None
        return {"id": user_id, "name": name, "email": email}, token

    def login(self, data):
        email = text(data, "email", 3, 254).lower()
        password = data.get("password")
        if not isinstance(password, str) or not 1 <= len(password) <= 128:
            raise Problem("Email atau kata sandi salah.", 401)
        with self.db(True) as db:
            row = db.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
            # Equal-cost hashing prevents the missing-account branch exposing account existence.
            stored = row["password"] if row else "00" * 16 + "$" + "00" * 32
            if not hmac.compare_digest(password_hash(password, stored.split("$")[0]), stored):
                raise Problem("Email atau kata sandi salah.", 401)
            token = self.session(row["id"], db)
            return {key: row[key] for key in ("id", "name", "email")}, token

    def user(self, token):
        if not token:
            return None
        with self.db() as db:
            row = db.execute("SELECT u.id,u.name,u.email FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>?", (hashlib.sha256(token.encode()).hexdigest(), self.now())).fetchone()
            return dict(row) if row else None

    def logout(self, token):
        with self.db(True) as db:
            db.execute("DELETE FROM sessions WHERE token=?", (hashlib.sha256(token.encode()).hexdigest(),))

    def catalogue(self):
        return {"tutors": TUTORS, "subjects": SUBJECTS, "lessons": [public_lesson(x) for x in LESSONS], "packages": PACKAGES, "promos": PROMOS, "today": datetime.fromtimestamp(self.now(), WIB).date().isoformat(), "now": self.now(), "demo": True}

    def slot(self, data):
        date = text(data, "date", 10, 10)
        hour = integer(data, "hour", 8, 20)
        try:
            start = int(datetime.strptime(f"{date} {hour}", "%Y-%m-%d %H").replace(tzinfo=WIB).timestamp())
        except ValueError:
            raise Problem("Tanggal tidak valid.") from None
        if start <= self.now() or start > self.now() + 90 * 86400:
            raise Problem("Pilih jadwal mendatang dalam 90 hari, waktu WIB.")
        return start, start + 3600, hour

    def price(self, tutor, code):
        if not isinstance(code, str) or len(code) > 30:
            raise Problem("Kode promo tidak valid.")
        code = code.strip().upper()
        promo = next((p for p in PROMOS if p["code"] == code), None)
        if code and not promo:
            raise Problem("Kode promo tidak ditemukan.")
        discount = min(tutor["price"] * promo["percent"] // 100, promo["cap"]) if promo else 0
        return {"price": tutor["price"], "discount": discount, "total": tutor["price"] - discount, "promo": code}

    def free(self, db, tutor_id, start, end, user_id=None):
        return not db.execute("SELECT id FROM bookings WHERE status IN ('pending','confirmed') AND start<? AND end>? AND (tutor_id=? OR user_id=?)", (end, start, tutor_id, user_id)).fetchone()

    def availability(self, data):
        start, end, hour = self.slot(data)
        with self.db() as db:
            return {"available": [t["id"] for t in TUTORS if hour in t["slots"] and self.free(db, t["id"], start, end)]}

    def book(self, user_id, data):
        level = text(data, "level", 2, 3)
        grade = integer(data, "grade", 1, 12)
        if level not in GRADES or grade not in GRADES[level]:
            raise Problem("Kelas tidak sesuai jenjang.")
        subject = text(data, "subject")
        topic = text(data, "topic")
        if subject not in SUBJECTS or topic not in SUBJECTS[subject]:
            raise Problem("Materi tidak sesuai mata pelajaran.")
        mode = text(data, "mode")
        if mode not in ("Online", "Offline"):
            raise Problem("Pilih metode Online atau Offline.")
        address = text(data, "address", 10, 500) if mode == "Offline" else ""
        start, end, hour = self.slot(data)
        tutor_id = text(data, "tutorId", 1, 40)
        with self.db(True) as db:
            candidates = [t for t in TUTORS if t["subject"] == subject and level in t["levels"] and mode in t["modes"] and hour in t["slots"]]
            if tutor_id == "auto":
                candidates.sort(key=lambda t: (-t["rating"], t["price"]))
            else:
                candidates = [t for t in candidates if t["id"] == tutor_id]
            tutor = next((t for t in candidates if self.free(db, t["id"], start, end, user_id)), None)
            if not tutor:
                raise Problem("Tutor atau jadwal tidak tersedia. Pilih waktu/tutor lain.", 409)
            price = self.price(tutor, data.get("promo", ""))
            booking_id = secrets.token_hex(12)
            db.execute("INSERT INTO bookings (id,user_id,tutor_id,level,grade,subject,topic,mode,address,start,end,status,price,discount,total,promo,created) VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending',?,?,?,?,?)", (booking_id, user_id, tutor["id"], level, grade, subject, topic, mode, address, start, end, price["price"], price["discount"], price["total"], price["promo"], self.now()))
            return dict(db.execute("SELECT * FROM bookings WHERE id=?", (booking_id,)).fetchone())

    def owned_booking(self, db, user_id, booking_id):
        row = db.execute("SELECT * FROM bookings WHERE id=? AND user_id=?", (booking_id, user_id)).fetchone()
        if not row:
            raise Problem("Pemesanan tidak ditemukan.", 404)
        return dict(row)

    def booking_action(self, user_id, booking_id, action, data):
        with self.db(True) as db:
            booking = self.owned_booking(db, user_id, booking_id)
            status = booking["status"]
            if action == "pay":
                method = text(data, "method")
                if method not in ("Demo e-wallet", "Demo bank"):
                    raise Problem("Pilih metode pembayaran simulasi.")
                if status == "confirmed":
                    return booking
                if status != "pending" or booking["start"] <= self.now():
                    raise Problem("Pemesanan ini tidak dapat dibayar.", 409)
                db.execute("INSERT INTO payments VALUES (?,?,?,?)", (booking_id, method, booking["total"], self.now()))
                status = "confirmed"
            elif action == "cancel":
                if status not in ("pending", "confirmed"):
                    raise Problem("Pemesanan ini tidak dapat dibatalkan.", 409)
                status = "cancelled"
            elif action == "complete":
                if status != "confirmed" or booking["end"] > self.now():
                    raise Problem("Sesi hanya dapat diselesaikan setelah jadwal berakhir.", 409)
                status = "completed"
            elif action == "notes":
                notes = text(data, "notes", 0, 10000)
                db.execute("UPDATE bookings SET notes=? WHERE id=?", (notes, booking_id))
            elif action == "review":
                if status != "completed":
                    raise Problem("Ulasan hanya untuk sesi yang sudah selesai.", 409)
                rating = integer(data, "rating", 1, 5)
                body = text(data, "body", 5, 2000)
                try:
                    db.execute("INSERT INTO reviews VALUES (?,?,?,?,?,?)", (booking_id, user_id, booking["tutor_id"], rating, body, self.now()))
                except sqlite3.IntegrityError:
                    raise Problem("Sesi ini sudah diulas.", 409) from None
            else:
                raise Problem("Tindakan tidak ditemukan.", 404)
            db.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id))
            return self.owned_booking(db, user_id, booking_id)

    def dashboard(self, user_id):
        with self.db() as db:
            bookings = [dict(r) for r in db.execute("SELECT b.*,EXISTS(SELECT 1 FROM reviews r WHERE r.booking_id=b.id) AS reviewed FROM bookings b WHERE user_id=? ORDER BY start", (user_id,))]
            completions = [r[0] for r in db.execute("SELECT lesson_id FROM completions WHERE user_id=?", (user_id,))]
            enrollments = [r[0] for r in db.execute("SELECT package_id FROM enrollments WHERE user_id=?", (user_id,))]
            attempts = [dict(r) for r in db.execute("SELECT * FROM attempts WHERE user_id=? ORDER BY created DESC,rowid DESC", (user_id,))]
            goal = db.execute("SELECT target FROM goals WHERE user_id=?", (user_id,)).fetchone()
            return {"bookings": bookings, "completions": completions, "enrollments": enrollments, "attempts": attempts, "goal": goal[0] if goal else 3, "now": self.now()}

    def learning_action(self, user_id, action, data):
        with self.db(True) as db:
            if action == "complete":
                lesson_id = text(data, "lessonId")
                if not any(x["id"] == lesson_id for x in LESSONS):
                    raise Problem("Materi tidak ditemukan.", 404)
                db.execute("INSERT OR IGNORE INTO completions VALUES (?,?,?)", (user_id, lesson_id, self.now()))
            elif action == "enroll":
                package_id = text(data, "packageId")
                if not any(x["id"] == package_id for x in PACKAGES):
                    raise Problem("Paket tidak ditemukan.", 404)
                db.execute("INSERT OR IGNORE INTO enrollments VALUES (?,?,?)", (user_id, package_id, self.now()))
            elif action == "goal":
                target = integer(data, "target", 1, len(LESSONS))
                db.execute("INSERT INTO goals VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET target=excluded.target", (user_id, target))
            else:
                raise Problem("Tindakan tidak ditemukan.", 404)
        return {"ok": True}

    def quiz(self, quiz_id):
        if quiz_id == "tryout":
            lesson_ids = [x["id"] for x in LESSONS]
        elif any(x["id"] == quiz_id for x in LESSONS):
            lesson_ids = [quiz_id]
        else:
            raise Problem("Latihan tidak ditemukan.", 404)
        return {"id": quiz_id, "questions": quiz_questions(lesson_ids)}

    def submit_quiz(self, user_id, data):
        quiz_id = text(data, "quizId")
        questions = self.quiz(quiz_id)["questions"]
        answers = data.get("answers")
        if not isinstance(answers, dict) or set(answers) != {q["id"] for q in questions}:
            raise Problem("Jawab semua soal sebelum mengirim.")
        feedback = []
        for question in questions:
            choice = answers[question["id"]]
            if type(choice) is not int or not 0 <= choice < len(question["options"]):
                raise Problem("Pilihan jawaban tidak valid.")
            lesson_id, index = question["id"].split(":")
            original = next(x for x in LESSONS if x["id"] == lesson_id)["questions"][int(index)]
            feedback.append({"id": question["id"], "correct": choice == original[2], "answer": original[2], "explanation": original[3]})
        correct = sum(x["correct"] for x in feedback)
        score = round(correct * 100 / len(questions))
        with self.db(True) as db:
            db.execute("INSERT INTO attempts VALUES (?,?,?,?,?,?,?)", (secrets.token_hex(12), user_id, quiz_id, score, len(questions), correct, self.now()))
        return {"score": score, "correct": correct, "total": len(questions), "feedback": feedback}

    def messages(self, user_id):
        with self.db() as db:
            return [dict(r) for r in db.execute("SELECT * FROM messages WHERE user_id=? ORDER BY created,rowid", (user_id,))]

    def send_message(self, user_id, data):
        tutor_id = text(data, "tutorId")
        if not any(t["id"] == tutor_id for t in TUTORS):
            raise Problem("Tutor tidak ditemukan.", 404)
        body = text(data, "body", 1, 2000)
        with self.db(True) as db:
            db.execute("INSERT INTO messages VALUES (?,?,?,?,?)", (secrets.token_hex(12), user_id, tutor_id, body, self.now()))
        return {"ok": True}

    def posts(self):
        with self.db() as db:
            return [dict(r) for r in db.execute("SELECT p.*,u.name,(SELECT count(*) FROM replies r WHERE r.post_id=p.id) AS replies FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.created DESC,p.rowid DESC")]

    def post(self, post_id):
        with self.db() as db:
            row = db.execute("SELECT p.*,u.name FROM posts p JOIN users u ON u.id=p.user_id WHERE p.id=?", (post_id,)).fetchone()
            if not row:
                raise Problem("Diskusi tidak ditemukan.", 404)
            return {"post": dict(row), "replies": [dict(r) for r in db.execute("SELECT r.*,u.name FROM replies r JOIN users u ON u.id=r.user_id WHERE post_id=? ORDER BY r.created,r.rowid", (post_id,))]}

    def create_post(self, user_id, data):
        title = text(data, "title", 5, 120)
        body = text(data, "body", 5, 4000)
        subject = text(data, "subject")
        if subject not in SUBJECTS:
            raise Problem("Mata pelajaran tidak valid.")
        post_id = secrets.token_hex(12)
        with self.db(True) as db:
            db.execute("INSERT INTO posts VALUES (?,?,?,?,?,?)", (post_id, user_id, title, body, subject, self.now()))
        return {"id": post_id}

    def reply(self, user_id, post_id, data):
        body = text(data, "body", 1, 4000)
        with self.db(True) as db:
            if not db.execute("SELECT id FROM posts WHERE id=?", (post_id,)).fetchone():
                raise Problem("Diskusi tidak ditemukan.", 404)
            db.execute("INSERT INTO replies VALUES (?,?,?,?,?)", (secrets.token_hex(12), post_id, user_id, body, self.now()))
        return {"ok": True}

    def reviews(self):
        with self.db() as db:
            return [dict(r) for r in db.execute("SELECT r.tutor_id,r.rating,r.body,r.created,u.name FROM reviews r JOIN users u ON r.user_id=u.id ORDER BY r.created DESC")]

    def assistant(self, user_id, data):
        question = text(data, "question", 3, 1000)
        tokens = set(re.findall(r"[\w]+", question.lower()))
        ranked = sorted(LESSONS, key=lambda x: len(tokens.intersection(x["keywords"])), reverse=True)
        selected = [x for x in ranked[:2] if tokens.intersection(x["keywords"])]
        answer = "\n\n".join(f'{x["title"]}\n' + "\n".join(s[1] for s in x["sections"]) for x in selected) if selected else "Aku belum memiliki materi yang cocok untuk pertanyaan ini. Coba topik bilangan bulat, aljabar, Pythagoras, simple present, siklus air, gerak, sel, atom, atau sapaan Mandarin."
        sources = [{"id": x["id"], "title": x["title"]} for x in selected]
        with self.db(True) as db:
            db.execute("INSERT INTO assistant_history VALUES (?,?,?,?,?,?)", (secrets.token_hex(12), user_id, question, answer, json.dumps(sources), self.now()))
        return {"answer": answer, "sources": sources, "mode": "material-retrieval"}

    def assistant_messages(self, user_id):
        with self.db() as db:
            rows = [dict(r) for r in db.execute("SELECT question,answer,sources,created FROM assistant_history WHERE user_id=? ORDER BY created DESC,rowid DESC LIMIT 20", (user_id,))]
        for row in rows:
            row["sources"] = json.loads(row["sources"])
        return list(reversed(rows))
