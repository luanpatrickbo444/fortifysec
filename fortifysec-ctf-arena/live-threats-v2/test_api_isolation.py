import importlib.util
import os
import sqlite3
import tempfile
import time
from pathlib import Path
from unittest.mock import patch

from flask import Flask

PLUGIN = (
    "/opt/CTFd/CTFd/plugins/"
    "fortifysec_labs_v5/__init__.py"
)

with tempfile.TemporaryDirectory() as temp:
    db_path = str(Path(temp) / "events.sqlite3")

    con = sqlite3.connect(db_path)

    con.execute("""
        CREATE TABLE events (
            id INTEGER PRIMARY KEY,
            ts INTEGER,
            student TEXT,
            lab TEXT,
            status_class TEXT,
            latency_bucket TEXT,
            method TEXT,
            route_class TEXT,
            event_category TEXT,
            http_status INTEGER,
            rule_id TEXT
        )
    """)

    now = int(time.time())

    con.executemany("""
        INSERT INTO events (
            id, ts, student, lab,
            status_class, latency_bucket,
            method, route_class, event_category,
            http_status, rule_id
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
    """, [
        (1, now, "ctfd-101", "lab-a",
         "2xx", "fast", "GET", "other",
         "http", 200, "http_normal"),

        (2, now, "ctfd-202", "lab-b",
         "4xx", "fast", "POST", "auth",
         "auth", 401, "auth_failure"),

        (3, now, "ctfd-101", "lab-a",
         "4xx", "fast", "GET", "other",
         "http_error", 404, "http_404"),
    ])

    con.commit()
    con.close()

    os.environ["FS_LIVE_DB"] = db_path

    spec = importlib.util.spec_from_file_location(
        "fortifysec_labs_v5_test",
        PLUGIN
    )

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    app = Flask("fortifysec-v2-security-test")
    app.secret_key = "isolated-test-only"
    app.register_blueprint(module.bp)

    # O decorator de autenticação do CTFd já foi aplicado
    # na definição da rota. Neste teste isolado, substituímos
    # exclusivamente a função registrada no Flask.
    endpoint = next(
        rule.endpoint
        for rule in app.url_map.iter_rules()
        if rule.rule == "/labs/live-attacks/api/events"
    )

    app.view_functions[endpoint] = module.events.__wrapped__

    client = app.test_client()

    class User:
        def __init__(self, user_id):
            self.id = user_id

    def check(label, user_id, admin, expected):
        user = User(user_id) if user_id else None

        with (
            patch.object(module, "get_current_user", return_value=user),
            patch.object(module, "is_admin", return_value=admin),
        ):
            response = client.get(
                "/labs/live-attacks/api/events"
            )

        if expected is None:
            assert response.status_code == 401, (
                label, response.status_code
            )
            print(label, "HTTP 401: OK")
            return

        assert response.status_code == 200, (
            label, response.status_code,
            response.get_json()
        )

        data = response.get_json()["data"]
        ids = {event["id"] for event in data["events"]}

        assert ids == expected, (
            label, ids, expected
        )

        assert response.headers["Cache-Control"] == "no-store"

        print(label, "eventos", sorted(ids), ": OK")

    check("ADMIN", 1, True, {1, 2, 3})
    check("ALUNO A", 101, False, {1, 3})
    check("ALUNO B", 202, False, {2})
    check("NÃO AUTENTICADO", None, False, None)

    print("\nISOLAMENTO DA API V2: APROVADO")
