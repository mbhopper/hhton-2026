import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from psycopg2.errors import UniqueViolation
from dotenv import load_dotenv

from auth import auth_required
from qr_model import QRModel
from user_model import UserModel

load_dotenv()

app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", re.I)


def _to_iso(value):
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    return value


@app.post("/api/auth/register")
def register():
    body = request.get_json(silent=True) or {}
    email = body.get("email")
    password = body.get("password")
    full_name = body.get("full_name")
    if not email or not password or not full_name:
        return jsonify({"success": False, "message": "Необходимо указать email, password и full_name"}), 400

    try:
        user = UserModel.create(email, password, full_name)
        return (
            jsonify(
                {
                    "success": True,
                    "data": {"id": str(user["id"]), "email": user["email"], "full_name": user["full_name"]},
                }
            ),
            201,
        )
    except UniqueViolation:
        return jsonify({"success": False, "message": "Пользователь с таким email уже существует"}), 409
    except Exception:
        return jsonify({"success": False, "message": "Ошибка регистрации пользователя"}), 500


@app.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    email = body.get("email")
    password = body.get("password")
    if not email or not password:
        return jsonify({"success": False, "message": "Необходимо указать email и password"}), 400

    user = UserModel.find_by_email(email)
    if not user or not UserModel.compare_password(password, user["password_hash"]):
        return jsonify({"success": False, "message": "Неверный email или пароль"}), 401

    payload = {"id": str(user["id"]), "email": user["email"], "exp": datetime.now(timezone.utc) + timedelta(days=7)}
    token = jwt.encode(payload, os.getenv("JWT_SECRET"), algorithm="HS256")
    return jsonify({"success": True, "token": token})


@app.post("/api/qr/generate")
@auth_required
def qr_generate():
    try:
        user_id = request.user["id"]
        qr = QRModel.generate_for_user(user_id, ttl_seconds=300)
        expires_at = qr["expires_at"]
        valid_for = max(0, int((expires_at.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).total_seconds()))
        return jsonify(
            {
                "success": True,
                "data": {
                    "qr_code": str(qr["qr_code"]),
                    "generated_at": _to_iso(qr["generated_at"]),
                    "expires_at": _to_iso(expires_at),
                    "valid_for_seconds": valid_for,
                },
            }
        )
    except Exception:
        return jsonify({"success": False, "message": "Ошибка генерации QR-кода"}), 500


@app.post("/api/qr/validate")
def qr_validate():
    body = request.get_json(silent=True) or {}
    qr_code = body.get("qr_code")
    scanner_id = body.get("scanner_id")

    if not qr_code:
        return jsonify({"success": False, "message": "QR код обязателен"}), 400
    if not isinstance(qr_code, str) or not UUID_RE.match(qr_code.strip()):
        return jsonify({"success": False, "message": "Некорректный QR код"}), 400

    xfwd = request.headers.get("x-forwarded-for", "")
    ip_address = xfwd.split(",")[0].strip() if xfwd else request.remote_addr
    user_agent = request.headers.get("user-agent")
    result = QRModel.validate_and_consume(qr_code.strip(), scanner_id, ip_address, user_agent)

    if result["valid"]:
        return jsonify({"success": True, "message": "Доступ разрешен", "data": result})

    messages = {
        "not_found": "QR-код не найден",
        "already_used": "QR-код уже был использован",
        "expired": "Срок действия QR-кода истек",
    }
    return jsonify({"success": False, "message": messages.get(result["reason"], "Доступ запрещен")}), 403


@app.get("/api/qr/current")
@auth_required
def qr_current():
    try:
        user_id = request.user["id"]
        active = QRModel.find_active_by_user(user_id)
        if not active:
            return jsonify({"success": True, "data": None, "message": "Нет активного QR-кода"})
        expires_at = active["expires_at"]
        time_left = max(0, int((expires_at.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).total_seconds() * 1000))
        return jsonify(
            {
                "success": True,
                "data": {"qr_code": str(active["qr_code"]), "expires_at": _to_iso(expires_at), "time_left": time_left},
            }
        )
    except Exception:
        return jsonify({"success": False, "message": "Ошибка получения текущего QR-кода"}), 500


@app.get("/api/qr/stats")
@auth_required
def qr_stats():
    try:
        stats = QRModel.get_user_stats(request.user["id"])
        return jsonify({"success": True, "data": stats})
    except Exception:
        return jsonify({"success": False, "message": "Ошибка получения статистики"}), 500


@app.get("/health")
def health():
    return jsonify({"status": "OK", "time": datetime.now(timezone.utc).isoformat(), "db": os.getenv("DB_DATABASE")})


@app.get("/")
def root():
    return send_from_directory(Path(app.root_path) / "public", "index.html")


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port)
