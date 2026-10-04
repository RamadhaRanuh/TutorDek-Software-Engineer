"""Same-origin JSON API and an explicit static-file surface for the local app."""

from collections import defaultdict, deque
from http.cookies import SimpleCookie, CookieError
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import logging
import mimetypes
import os
from pathlib import Path
import sqlite3
import threading
import time
from urllib.parse import unquote, urlsplit

from .service import Problem

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "TutorDek Software Engineer" / "TutorDek-Final-Project-main"
PAGES = {"landing-page.html", "signup.html", "sign-in.html", "paket-belajar.html", "e-book.html", "promo.html", "testimoni.html", "pesan-kelas-milih.html", "pesan-kelas-random.html", "tes-map.html"}
STATIC_DIRECTORIES = {"CSS", "Javascript", "public", "fitur", "Sign-in fiture", "Sign-up fiture", "vendor"}


class AppServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address, service):
        self.service = service
        self.auth_attempts = defaultdict(deque)
        self.rate_lock = threading.Lock()
        self.secure_cookie = os.environ.get("TUTORDEK_SECURE_COOKIE") == "1"
        super().__init__(address, Handler)

    def rate_limit(self, address):
        now = time.monotonic()
        with self.rate_lock:
            # Bound the bucket map and expire old entries without storing credentials.
            for key in list(self.auth_attempts):
                if not self.auth_attempts[key] or self.auth_attempts[key][-1] < now - 600:
                    del self.auth_attempts[key]
            bucket = self.auth_attempts[address]
            while bucket and bucket[0] < now - 600:
                bucket.popleft()
            if len(bucket) >= 20:
                raise Problem("Terlalu banyak percobaan. Coba lagi dalam 10 menit.", 429)
            bucket.append(now)


class Handler(BaseHTTPRequestHandler):
    server_version = "TutorDek"

    def setup(self):
        super().setup()
        self.connection.settimeout(10)

    def log_message(self, format, *args):
        # Avoid logging query strings, cookies, or submitted content.
        pass

    def respond(self, status, content, content_type="application/json; charset=utf-8", cookie=None, location=None, remember=True):
        if isinstance(content, (dict, list)):
            content = json.dumps(content, ensure_ascii=False).encode("utf-8")
        elif isinstance(content, str):
            content = content.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("X-Frame-Options", "DENY")
        # The original pages use inline event handlers. Assets and API calls stay local.
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'")
        if cookie is not None:
            suffix = "; Secure" if self.server.secure_cookie else ""
            age = f"; Max-Age={604800 if cookie else 0}" if remember or not cookie else ""
            self.send_header("Set-Cookie", f"tutordek_session={cookie}; HttpOnly; SameSite=Lax; Path=/{age}{suffix}")
        if location:
            self.send_header("Location", location)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(content)

    def token(self):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get("Cookie", ""))
        except CookieError:
            return ""
        return cookie["tutordek_session"].value if "tutordek_session" in cookie else ""

    def body(self):
        if self.headers.get("X-TutorDek") != "1":
            raise Problem("Permintaan harus berasal dari aplikasi TutorDek.", 403)
        origin = self.headers.get("Origin")
        host = self.headers.get("Host", "")
        if origin and origin not in (f"http://{host}", f"https://{host}"):
            raise Problem("Asal permintaan tidak diizinkan.", 403)
        if self.headers.get_content_type() != "application/json":
            raise Problem("Gunakan JSON.", 415)
        if self.headers.get("Transfer-Encoding"):
            raise Problem("Transfer encoding tidak didukung.")
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            raise Problem("Ukuran permintaan tidak valid.") from None
        if not 1 <= length <= 65536:
            raise Problem("Ukuran permintaan tidak valid.", 413)
        try:
            value = json.loads(self.rfile.read(length))
        except (ValueError, UnicodeDecodeError):
            raise Problem("JSON tidak valid.") from None
        if not isinstance(value, dict):
            raise Problem("Isi permintaan harus berupa objek JSON.")
        return value

    def do_HEAD(self):
        self.handle_request()

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()

    def handle_request(self):
        try:
            host = self.headers.get("Host", "")
            expected_hosts = {f"localhost:{self.server.server_port}", f"127.0.0.1:{self.server.server_port}"}
            extra_host = os.environ.get("TUTORDEK_PUBLIC_HOST")
            if extra_host:
                expected_hosts.add(extra_host)
            if host not in expected_hosts:
                raise Problem("Host tidak diizinkan.", 403)
            path = unquote(urlsplit(self.path).path)
            if path.startswith("/api/"):
                self.api(path)
            elif self.command in ("GET", "HEAD"):
                self.static(path)
            else:
                raise Problem("Rute tidak ditemukan.", 404)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, TimeoutError):
            # Navigating away closes a response socket; no second response can be sent.
            return
        except Problem as error:
            self.respond(error.status, {"error": str(error)})
        except (sqlite3.Error, OSError, ValueError, KeyError, TypeError):
            logging.exception("TutorDek request failed")
            self.respond(500, {"error": "Terjadi kesalahan server. Silakan coba lagi."})

    def api(self, path):
        service = self.server.service
        get = self.command in ("GET", "HEAD")
        data = None if get else self.body()
        token = self.token()
        user = service.user(token)
        if get:
            if path == "/api/health":
                result = {"ok": True}
            elif path == "/api/catalogue":
                result = service.catalogue()
            elif path == "/api/me":
                result = {"user": user}
            elif path == "/api/posts":
                result = service.posts()
            elif path.startswith("/api/posts/"):
                result = service.post(path.removeprefix("/api/posts/"))
            elif path == "/api/reviews":
                result = service.reviews()
            elif path.startswith("/api/quiz/"):
                result = service.quiz(path.removeprefix("/api/quiz/"))
            else:
                if not user:
                    raise Problem("Silakan masuk terlebih dahulu.", 401)
                if path == "/api/dashboard":
                    result = service.dashboard(user["id"])
                elif path == "/api/messages":
                    result = service.messages(user["id"])
                elif path == "/api/assistant":
                    result = service.assistant_messages(user["id"])
                else:
                    raise Problem("Rute tidak ditemukan.", 404)
            return self.respond(200, result)
        if path in ("/api/signup", "/api/login"):
            self.server.rate_limit(self.client_address[0])
            new_user, new_token = service.signup(data) if path.endswith("signup") else service.login(data)
            # Signing in rotates the browser session, revoking its previous token.
            if token:
                service.logout(token)
            return self.respond(201 if path.endswith("signup") else 200, {"user": new_user}, cookie=new_token, remember=data.get("remember", True) is not False)
        if path == "/api/availability":
            return self.respond(200, service.availability(data))
        if not user:
            raise Problem("Silakan masuk terlebih dahulu.", 401)
        uid = user["id"]
        if path == "/api/logout":
            service.logout(token)
            return self.respond(200, {"ok": True}, cookie="")
        if path == "/api/bookings":
            result = service.book(uid, data)
        elif path.startswith("/api/bookings/"):
            parts = path.split("/")
            if len(parts) != 5:
                raise Problem("Rute tidak ditemukan.", 404)
            result = service.booking_action(uid, parts[3], parts[4], data)
        elif path.startswith("/api/learning/"):
            result = service.learning_action(uid, path.removeprefix("/api/learning/"), data)
        elif path == "/api/quiz":
            result = service.submit_quiz(uid, data)
        elif path == "/api/messages":
            result = service.send_message(uid, data)
        elif path == "/api/posts":
            result = service.create_post(uid, data)
        elif path.startswith("/api/posts/") and path.endswith("/reply"):
            parts = path.split("/")
            if len(parts) != 5:
                raise Problem("Rute tidak ditemukan.", 404)
            result = service.reply(uid, parts[3], data)
        elif path == "/api/assistant":
            result = service.assistant(uid, data)
        else:
            raise Problem("Rute tidak ditemukan.", 404)
        self.respond(200, result)

    def static(self, path):
        relative = path.removeprefix("/TutorDek Software Engineer/TutorDek-Final-Project-main/").lstrip("/")
        if relative in ("", "index.html"):
            relative = "landing-page.html"
        elif relative == "favicon.ico":
            relative = "public/school.svg"
        elif relative.startswith("assets/"):
            relative = "public/" + relative.removeprefix("assets/")
        parts = Path(relative).parts
        if relative not in PAGES and (not parts or parts[0] not in STATIC_DIRECTORIES):
            raise Problem("Halaman tidak ditemukan.", 404)
        root = FRONTEND
        target = (root / relative).resolve()
        if (not target.is_relative_to(root.resolve()) or not target.is_file()
                or target.suffix.lower() not in {".html", ".css", ".js", ".svg", ".png", ".jpg", ".jpeg", ".webp", ".woff", ".woff2", ".ttf", ".ico"}):
            raise Problem("Berkas tidak ditemukan.", 404)
        kind = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        if target.suffix == ".js":
            kind = "text/javascript"
        if kind.startswith("text/") or kind == "image/svg+xml":
            kind += "; charset=utf-8"
        self.respond(200, target.read_bytes(), kind)
