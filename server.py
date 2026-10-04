"""Run with python server.py; no runtime dependencies or third-party services."""

import argparse
import os
from pathlib import Path
import tempfile

from tutordek.http import AppServer
from tutordek.service import Service


def main():
    parser = argparse.ArgumentParser(description="TutorDek local application")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--temporary", action="store_true", help="Use isolated temporary test data")
    args = parser.parse_args()
    temporary = tempfile.TemporaryDirectory(prefix="tutordek-") if args.temporary else None
    database = Path(temporary.name) / "test.sqlite3" if temporary else Path(os.environ.get("TUTORDEK_DB", str(Path(__file__).parent / "data" / "tutordek.sqlite3")))
    server = AppServer((args.host, args.port), Service(database))
    print(f"TutorDek: http://127.0.0.1:{server.server_port} (demo checkout, local learning materials)", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        if temporary:
            temporary.cleanup()


if __name__ == "__main__":
    main()
