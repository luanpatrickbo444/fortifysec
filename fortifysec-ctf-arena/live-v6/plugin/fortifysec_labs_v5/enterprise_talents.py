import os
import hmac
import sqlite3

from flask import Blueprint, request, jsonify
from sqlalchemy import func

from CTFd.models import Users, Solves, Challenges, db

enterprise_bp = Blueprint("fortifysec_enterprise", __name__)


@enterprise_bp.get("/labs/api/enterprise-talents")
def enterprise_talents():
    expected = os.environ.get("FORTIFYSEC_ARENA_READ_TOKEN", "")

    authorization = request.headers.get("Authorization", "")
    prefix = "Bearer "

    if (
        not expected
        or not authorization.startswith(prefix)
        or not hmac.compare_digest(
            authorization[len(prefix):], expected
        )
    ):
        return jsonify(error="Não autorizado"), 401

    students = (
        db.session.query(Users.id, Users.name)
        .filter(
            Users.type == "user",
            Users.hidden.is_(False),
            Users.banned.is_(False)
        )
        .all()
    )

    points = dict(
        db.session.query(
            Solves.user_id,
            func.coalesce(func.sum(Challenges.value), 0)
        )
        .join(Challenges, Solves.challenge_id == Challenges.id)
        .filter(Challenges.state == "visible")
        .group_by(Solves.user_id)
        .all()
    )

    solves = dict(
        db.session.query(
            Solves.user_id,
            func.count(func.distinct(Solves.challenge_id))
        )
        .join(Challenges, Solves.challenge_id == Challenges.id)
        .filter(Challenges.state == "visible")
        .group_by(Solves.user_id)
        .all()
    )

    lab_counts = {}
    labs_db = os.environ.get(
        "FS_LABS_SOLVES_DB",
        "/var/lib/fortifysec-ranking/solves.sqlite3"
    )

    try:
        with sqlite3.connect(
            "file:" + labs_db + "?mode=ro",
            uri=True,
            timeout=1
        ) as conn:
            lab_counts = {
                student: count
                for student, count in conn.execute(
                    "SELECT student, COUNT(*) FROM solves GROUP BY student"
                )
            }
    except (OSError, sqlite3.Error):
        pass

    allowed_raw = os.environ.get(
        "FORTIFYSEC_ENTERPRISE_ELIGIBLE_IDS", ""
    )
    allowed_ids = {
        int(value.strip())
        for value in allowed_raw.split(",")
        if value.strip().isdigit()
    }

    items = []

    for uid, name in students:
        authorized = uid in allowed_ids

        score = int(points.get(uid, 0))
        completed = int(lab_counts.get(f"ctfd-{uid}", 0))
        solved = int(solves.get(uid, 0))

        items.append({
            "id": str(uid),
            "name": name if authorized else f"Participante CTF #{uid}",
            "headline": None,
            "xp": score,
            "score": score,
            "solved_challenges": solved,
            "labs_completed": completed,
        })

    items.sort(
        key=lambda x: (
            -x["labs_completed"],
            -x["score"],
            x["name"].casefold(),
            int(x["id"])
        )
    )

    for position, item in enumerate(items, 1):
        item["position"] = position

    response = jsonify(items=items)
    response.headers["Cache-Control"] = "no-store"
    return response
