import os
from functools import wraps

import jwt
from flask import jsonify, request

from user_model import UserModel


def auth_required(handler):
    @wraps(handler)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[len("Bearer ") :] if header.startswith("Bearer ") else None
        if not token:
            return jsonify({"success": False, "message": "Пожалуйста, авторизуйтесь"}), 401

        try:
            decoded = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
            user = UserModel.find_by_id(decoded["id"])
            if not user:
                return jsonify({"success": False, "message": "Пожалуйста, авторизуйтесь"}), 401
            request.user = user
            return handler(*args, **kwargs)
        except Exception:
            return jsonify({"success": False, "message": "Пожалуйста, авторизуйтесь"}), 401

    return wrapped
