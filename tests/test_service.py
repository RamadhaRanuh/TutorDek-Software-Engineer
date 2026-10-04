from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
import tempfile
import unittest

from tutordek.content import LESSONS
from tutordek.service import Service, Problem, WIB


class LearningServiceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory(prefix="tutordek-service-tests-")
        cls.path = Path(cls.directory.name) / "app.sqlite3"
        cls.clock_value = datetime(2027, 1, 1, 8, tzinfo=WIB).timestamp()
        cls.service = Service(cls.path, lambda: cls.clock_value)
        cls.alice, cls.token = cls.service.signup({"name": "Alice Learner", "email": "alice@example.com", "password": "space kept 123 "})
        cls.bob, cls.bob_token = cls.service.signup({"name": "Bob Learner", "email": "bob@example.com", "password": "different 12345"})

    @classmethod
    def tearDownClass(cls):
        cls.directory.cleanup()

    def setUp(self):
        type(self).clock_value = datetime(2027, 1, 1, 8, tzinfo=WIB).timestamp()
        with self.service.db(True) as db:
            for table in ("payments", "reviews", "bookings", "messages", "completions", "attempts", "goals", "enrollments", "replies", "posts", "assistant_history"):
                db.execute(f"DELETE FROM {table}")

    def booking(self, **overrides):
        data = {"level": "SMA", "grade": 10, "subject": "Matematika", "topic": "aljabar", "tutorId": "anita", "mode": "Online", "date": "2027-01-02", "hour": 9, "promo": ""}
        return {**data, **overrides}

    def assert_problem(self, operation, status=400):
        with self.assertRaises(Problem) as caught:
            operation()
        self.assertEqual(status, caught.exception.status)

    def test_passwords_and_tokens_are_hashed(self):
        with self.service.db() as db:
            stored = db.execute("SELECT password FROM users WHERE id=?", (self.alice["id"],)).fetchone()[0]
            tokens = [r[0] for r in db.execute("SELECT token FROM sessions")]
        self.assertNotIn("space kept", stored)
        self.assertNotIn(self.token, tokens)
        user, token = self.service.login({"email": " ALICE@EXAMPLE.COM ", "password": "space kept 123 "})
        self.assertEqual(user["id"], self.alice["id"])
        self.assertIsNotNone(self.service.user(token))
        self.assert_problem(lambda: self.service.login({"email": "alice@example.com", "password": "space kept 123"}), 401)

    def test_registration_validation_and_duplicate(self):
        for data in ({"name": "A", "email": "test@test.com", "password": "long enough 123"}, {"name": "Alice", "email": "invalid", "password": "long enough 123"}, {"name": "Alice", "email": "test@test.com", "password": "short"}, {"name": None, "email": [], "password": 123}):
            self.assert_problem(lambda: self.service.signup(data))
        self.assert_problem(lambda: self.service.signup({"name": "Alice", "email": "ALICE@example.com", "password": "a longer password"}), 409)

    def test_expiry_and_logout(self):
        _, token = self.service.login({"email": "alice@example.com", "password": "space kept 123 "})
        type(self).clock_value += 604801
        self.assertIsNone(self.service.user(token))
        type(self).clock_value -= 604801
        self.service.logout(token)
        self.assertIsNone(self.service.user(token))

    def test_subject_grade_tutor_and_topic_validation(self):
        for overrides in ({"level": "SMP", "grade": 10}, {"grade": True}, {"subject": "Fisika"}, {"topic": "sel"}, {"tutorId": "bella"}, {"grade": "10"}, {"mode": "Teleport"}, {"promo": []}):
            self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(**overrides)), 409 if "tutorId" in overrides else 400)

    def test_future_advertised_slots_and_wib(self):
        for overrides in ({"date": "2026-12-31"}, {"date": "2027-05-01"}, {"date": "2027-02-30"}, {"hour": "9"}, {"hour": 9.5}):
            self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(**overrides)))
        self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(hour=10)), 409)
        b = self.service.book(self.alice["id"], self.booking())
        self.assertEqual(datetime.fromtimestamp(b["start"], WIB).hour, 9)
        self.assertEqual(b["end"] - b["start"], 3600)

    def test_offline_requires_address_and_date(self):
        self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(mode="Offline")))
        self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(mode="Offline", address="Jalan Pendidikan 10", date="")))
        b = self.service.book(self.alice["id"], self.booking(mode="Offline", address="Jalan Pendidikan 10"))
        self.assertEqual(b["address"], "Jalan Pendidikan 10")

    def test_price_and_promo_are_server_authoritative(self):
        b = self.service.book(self.alice["id"], self.booking(promo=" belajar20 ", price=1, total=1, discount=999999))
        self.assertEqual((b["price"], b["discount"], b["total"]), (85000, 17000, 68000))
        self.assert_problem(lambda: self.service.book(self.bob["id"], self.booking(hour=11, promo="INVALID")))

    def test_automatic_matching_respects_subject_rating_and_schedule(self):
        b = self.service.book(self.alice["id"], self.booking(tutorId="auto", subject="Fisika", topic="gerak"))
        self.assertEqual(b["tutor_id"], "ditto")
        c = self.service.book(self.bob["id"], self.booking(tutorId="auto", subject="Fisika", topic="gerak", hour=10))
        self.assertEqual(c["tutor_id"], "bella")
        self.assert_problem(lambda: self.service.book(self.bob["id"], self.booking(tutorId="auto", subject="Fisika", topic="gerak")), 409)

    def test_concurrent_reservations_only_allocate_one_slot(self):
        def attempt(uid):
            try:
                return self.service.book(uid, self.booking())["id"]
            except Problem as error:
                return error.status
        with ThreadPoolExecutor(max_workers=2) as pool:
            results = list(pool.map(attempt, [self.alice["id"], self.bob["id"]]))
        self.assertEqual(sum(isinstance(x, str) for x in results), 1)
        self.assertIn(409, results)

    def test_learner_cannot_reserve_overlapping_tutors(self):
        self.service.book(self.alice["id"], self.booking())
        self.assert_problem(lambda: self.service.book(self.alice["id"], self.booking(subject="Fisika", topic="gerak", tutorId="ditto")), 409)

    def test_cancel_releases_tutor_availability(self):
        b = self.service.book(self.alice["id"], self.booking())
        self.assertNotIn("anita", self.service.availability({"date": "2027-01-02", "hour": 9})["available"])
        self.service.booking_action(self.alice["id"], b["id"], "cancel", {})
        self.assertIn("anita", self.service.availability({"date": "2027-01-02", "hour": 9})["available"])
        self.assertEqual(self.service.book(self.bob["id"], self.booking())["status"], "pending")

    def test_payment_is_idempotent_and_cancellation_is_terminal(self):
        b = self.service.book(self.alice["id"], self.booking())
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "pay", {"method": "real card"}))
        for _ in range(2):
            result = self.service.booking_action(self.alice["id"], b["id"], "pay", {"method": "Demo bank"})
            self.assertEqual(result["status"], "confirmed")
        with self.service.db() as db:
            self.assertEqual(db.execute("SELECT count(*) FROM payments").fetchone()[0], 1)
        self.service.booking_action(self.alice["id"], b["id"], "cancel", {})
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "pay", {"method": "Demo bank"}), 409)

    def test_expired_pending_cannot_be_paid(self):
        b = self.service.book(self.alice["id"], self.booking())
        type(self).clock_value = b["end"] + 1
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "pay", {"method": "Demo bank"}), 409)

    def test_completion_and_review_are_time_gated_and_unique(self):
        b = self.service.book(self.alice["id"], self.booking())
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "complete", {}), 409)
        self.service.booking_action(self.alice["id"], b["id"], "pay", {"method": "Demo bank"})
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "complete", {}), 409)
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "review", {"rating": 5, "body": "Good tutor"}), 409)
        type(self).clock_value = b["end"] + 1
        self.service.booking_action(self.alice["id"], b["id"], "complete", {})
        self.service.booking_action(self.alice["id"], b["id"], "review", {"rating": 5, "body": "Good tutor"})
        self.assertEqual(self.service.reviews()[0]["rating"], 5)
        self.assert_problem(lambda: self.service.booking_action(self.alice["id"], b["id"], "review", {"rating": 5, "body": "Good tutor"}), 409)

    def test_ownership_for_all_booking_mutations(self):
        b = self.service.book(self.alice["id"], self.booking())
        for action in ("pay", "cancel", "complete", "review", "notes"):
            self.assert_problem(lambda: self.service.booking_action(self.bob["id"], b["id"], action, {}), 404)
        self.assertEqual(self.service.dashboard(self.bob["id"])["bookings"], [])

    def test_notes_messages_and_restart_persistence(self):
        b = self.service.book(self.alice["id"], self.booking())
        self.service.booking_action(self.alice["id"], b["id"], "notes", {"notes": "Remember x = 5"})
        self.service.send_message(self.alice["id"], {"tutorId": "anita", "body": "Can we study algebra?"})
        restored = Service(self.path, lambda: self.clock_value)
        self.assertEqual(restored.dashboard(self.alice["id"])["bookings"][0]["notes"], "Remember x = 5")
        self.assertEqual(len(restored.messages(self.alice["id"])), 1)
        self.assertEqual(restored.messages(self.bob["id"]), [])
        self.assert_problem(lambda: self.service.send_message(self.alice["id"], {"tutorId": "missing", "body": "Hi"}), 404)

    def test_learning_is_idempotent_and_private(self):
        for _ in range(2):
            self.service.learning_action(self.alice["id"], "complete", {"lessonId": "aljabar"})
            self.service.learning_action(self.alice["id"], "enroll", {"packageId": "smp"})
        self.service.learning_action(self.alice["id"], "goal", {"target": 5})
        d = self.service.dashboard(self.alice["id"])
        self.assertEqual(d["completions"], ["aljabar"])
        self.assertEqual(d["enrollments"], ["smp"])
        self.assertEqual(d["goal"], 5)
        self.assertEqual(self.service.dashboard(self.bob["id"])["completions"], [])
        for action, data in (("complete", {"lessonId": "missing"}), ("enroll", {"packageId": "missing"})):
            self.assert_problem(lambda: self.service.learning_action(self.alice["id"], action, data), 404)
        self.assert_problem(lambda: self.service.learning_action(self.alice["id"], "goal", {"target": True}))

    def test_quiz_answers_hidden_and_scored_on_server(self):
        quiz = self.service.quiz("aljabar")
        self.assertNotIn("answer", str(quiz))
        self.assertNotIn("questions", self.service.catalogue()["lessons"][0])
        self.assert_problem(lambda: self.service.submit_quiz(self.alice["id"], {"quizId": "aljabar", "answers": {}}))
        self.assert_problem(lambda: self.service.submit_quiz(self.alice["id"], {"quizId": "aljabar", "answers": {"aljabar:0": True, "aljabar:1": 2}}))
        result = self.service.submit_quiz(self.alice["id"], {"quizId": "aljabar", "answers": {"aljabar:0": 1, "aljabar:1": 0}, "score": 100})
        self.assertEqual(result["score"], 50)
        self.assertEqual(self.service.dashboard(self.alice["id"])["attempts"][0]["score"], 50)
        self.assertEqual(self.service.dashboard(self.bob["id"])["attempts"], [])
        self.assertEqual(len(self.service.quiz("tryout")["questions"]), len(LESSONS) * 2)

    def test_forum_validates_post_and_saves_replies(self):
        post = self.service.create_post(self.alice["id"], {"title": "How does algebra work?", "body": "I have tried balancing both sides.", "subject": "Matematika"})
        self.service.reply(self.bob["id"], post["id"], {"body": "Try subtracting the same number."})
        self.assertEqual(self.service.posts()[0]["replies"], 1)
        self.assertEqual(self.service.post(post["id"])["replies"][0]["name"], "Bob Learner")
        self.assertNotIn("email", str(self.service.posts()))
        self.assert_problem(lambda: self.service.reply(self.bob["id"], "missing", {"body": "Hello"}), 404)

    def test_assistant_grounding_and_history_isolation(self):
        result = self.service.assistant(self.alice["id"], {"question": "Jelaskan teorema Pythagoras"})
        self.assertEqual(result["sources"][0]["id"], "pythagoras")
        self.assertIn("a² + b² = c²", result["answer"])
        unsupported = self.service.assistant(self.alice["id"], {"question": "Explain quantum gravity"})
        self.assertEqual(unsupported["sources"], [])
        self.assertEqual(len(self.service.assistant_messages(self.alice["id"])), 2)
        self.assertEqual(self.service.assistant_messages(self.bob["id"]), [])


if __name__ == "__main__":
    unittest.main()
