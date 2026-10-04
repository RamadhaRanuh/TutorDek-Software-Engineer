from http.client import HTTPConnection
import json
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import Mock

from tutordek.http import AppServer
from tutordek.service import Service


class HTTPTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = tempfile.TemporaryDirectory(prefix="tutordek-http-tests-")
        cls.server = AppServer(("127.0.0.1", 0), Service(Path(cls.directory.name) / "http.sqlite3"))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        cls.directory.cleanup()

    def request(self, method, path, data=None, headers=None):
        connection = HTTPConnection("127.0.0.1", self.server.server_port, timeout=5)
        common = {"Content-Type": "application/json", "X-TutorDek": "1", **(headers or {})}
        connection.request(method, path, body=json.dumps(data) if data is not None else None, headers=common)
        response = connection.getresponse()
        body = response.read()
        result = response.status, dict(response.getheaders()), body
        connection.close()
        return result

    def test_api_and_allowlisted_static_files(self):
        for path in ("/", "/Javascript/popup.js", "/CSS/global.css", "/public/content@2x.png", "/api/health", "/api/catalogue"):
            status, headers, body = self.request("GET", path)
            self.assertEqual(status, 200, path)
            self.assertIn("Content-Security-Policy", headers)
            self.assertTrue(body)
        for path in ("/server.py", "/data/tutordek.sqlite3", "/web/../../server.py", "/assets/%2e%2e/ExportDBTutorDek.sql", "/.git/config"):
            self.assertEqual(self.request("GET", path)[0], 404, path)
        self.assertEqual(self.request("GET", "/api/health", headers={"Host": "hostile.example"})[0], 403)

    def test_original_pages_are_served_without_replacing_their_interface(self):
        from tutordek.http import PAGES
        for page in PAGES:
            for prefix in ("/", "/TutorDek%20Software%20Engineer/TutorDek-Final-Project-main/"):
                status, headers, body = self.request("GET", prefix + page)
                self.assertEqual(status, 200)
                self.assertNotIn("Location", headers)
                self.assertNotIn(b'http-equiv="refresh"', body)
        body = self.request("GET", "/")[2]
        self.assertIn(b'class="hero-section"', body)
        self.assertIn(b'class="desktop-default"', body)

    def test_csrf_body_bounds_types_and_unknown_routes(self):
        self.assertEqual(self.request("POST", "/api/login", {}, {"X-TutorDek": ""})[0], 403)
        self.assertEqual(self.request("POST", "/api/login", {}, {"Origin": "https://hostile.example"})[0], 403)
        self.assertEqual(self.request("POST", "/api/login", {}, {"Content-Type": "text/plain"})[0], 415)
        self.assertEqual(self.request("POST", "/api/login", ["invalid"])[0], 400)
        self.assertEqual(self.request("POST", "/api/login", {"email": "x" * 66000})[0], 413)
        self.assertEqual(self.request("GET", "/api/missing")[0], 401)
        self.assertEqual(self.request("POST", "/api/bookings", {})[0], 401)
        self.assertEqual(self.request("GET", "/api/me")[2], b'{"user": null}')

    def test_real_cookie_session_login_logout_and_private_data(self):
        data = {"name": "HTTP Learner", "email": "http@example.com", "password": "a real password 123"}
        status, headers, body = self.request("POST", "/api/signup", data)
        self.assertEqual(status, 201)
        self.assertNotIn("password", body.decode())
        self.assertIn("HttpOnly", headers["Set-Cookie"])
        self.assertIn("SameSite=Lax", headers["Set-Cookie"])
        cookie = {"Cookie": headers["Set-Cookie"].split(";")[0]}
        self.assertEqual(self.request("GET", "/api/dashboard", headers=cookie)[0], 200)
        self.assertEqual(self.request("POST", "/api/messages", {"tutorId": "anita", "body": "A question"}, cookie)[0], 200)
        self.assertEqual(len(json.loads(self.request("GET", "/api/messages", headers=cookie)[2])), 1)
        status, next_headers, _ = self.request("POST", "/api/login", data, cookie)
        self.assertEqual(status, 200)
        self.assertEqual(self.request("GET", "/api/dashboard", headers=cookie)[0], 401)
        next_cookie = {"Cookie": next_headers["Set-Cookie"].split(";")[0]}
        self.assertEqual(self.request("POST", "/api/logout", {}, next_cookie)[0], 200)
        self.assertEqual(self.request("GET", "/api/dashboard", headers=next_cookie)[0], 401)

    def test_rate_limit(self):
        with self.server.rate_lock:
            self.server.auth_attempts.clear()
        for _ in range(20):
            self.server.rate_limit("test-address")
        from tutordek.service import Problem
        with self.assertRaises(Problem) as caught:
            self.server.rate_limit("test-address")
        self.assertEqual(caught.exception.status, 429)

    def test_remember_me_controls_browser_cookie_persistence(self):
        data = {"name": "Cookie Learner", "email": "cookie@example.com", "password": "a real password 456"}
        self.assertEqual(self.request("POST", "/api/signup", data)[0], 201)
        status, headers, _ = self.request("POST", "/api/login", {**data, "remember": False})
        self.assertEqual(status, 200)
        self.assertNotIn("Max-Age", headers["Set-Cookie"])
        status, headers, _ = self.request("POST", "/api/login", {**data, "remember": True})
        self.assertEqual(status, 200)
        self.assertIn("Max-Age=604800", headers["Set-Cookie"])

    def test_navigation_disconnect_does_not_send_a_second_response(self):
        from tutordek.http import Handler
        for error in (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            with self.subTest(error=error):
                handler = Handler.__new__(Handler)
                handler.headers = {"Host": f"127.0.0.1:{self.server.server_port}"}
                handler.path = "/api/health"
                handler.command = "GET"
                handler.server = self.server
                handler.send_response = Mock()
                handler.send_header = Mock()
                handler.end_headers = Mock()
                handler.wfile = Mock()
                handler.wfile.write.side_effect = error("client navigated away")
                with self.assertNoLogs(level="ERROR"):
                    handler.do_GET()
                handler.send_response.assert_called_once_with(200)


if __name__ == "__main__":
    unittest.main()
