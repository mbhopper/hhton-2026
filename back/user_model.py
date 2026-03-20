import bcrypt

from db import fetch_one


class UserModel:
    @staticmethod
    def create(email, password, full_name):
        password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=10)).decode("utf-8")
        return fetch_one(
            """
            INSERT INTO users (email, password_hash, full_name)
            VALUES (%s, %s, %s)
            RETURNING id, email, full_name, created_at, updated_at
            """,
            [email, password_hash, full_name],
        )

    @staticmethod
    def find_by_email(email):
        return fetch_one("SELECT * FROM users WHERE email = %s", [email])

    @staticmethod
    def find_by_id(user_id):
        return fetch_one(
            "SELECT id, email, full_name, created_at, updated_at FROM users WHERE id = %s",
            [user_id],
        )

    @staticmethod
    def compare_password(password, password_hash):
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
