import uuid
from datetime import datetime, timedelta, timezone

from db import execute, fetch_one


class QRModel:
    @staticmethod
    def _now():
        return datetime.now(timezone.utc)

    @staticmethod
    def generate_for_user(user_id, ttl_seconds=300):
        execute(
            """
            UPDATE qr_codes
            SET status = 'expired'
            WHERE user_id = %s
              AND status = 'active'
              AND expires_at <= NOW()
            """,
            [user_id],
        )

        active = QRModel.find_active_by_user(user_id)
        if active:
            return active

        qr_code = str(uuid.uuid4())
        expires_at = QRModel._now() + timedelta(seconds=ttl_seconds)
        created = fetch_one(
            """
            INSERT INTO qr_codes (user_id, qr_code, status, expires_at)
            VALUES (%s, %s::uuid, 'active', %s)
            RETURNING id, user_id, qr_code, status, generated_at, expires_at
            """,
            [user_id, qr_code, expires_at],
        )
        return created

    @staticmethod
    def find_active_by_user(user_id):
        return fetch_one(
            """
            SELECT *
            FROM qr_codes
            WHERE user_id = %s
              AND status = 'active'
              AND expires_at > NOW()
            ORDER BY generated_at DESC
            LIMIT 1
            """,
            [user_id],
        )

    @staticmethod
    def mark_expired(qr_id):
        execute("UPDATE qr_codes SET status = 'expired' WHERE id = %s", [qr_id])

    @staticmethod
    def get_user_stats(user_id):
        return fetch_one(
            """
            SELECT
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) AS used,
              SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) AS expired,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active
            FROM qr_codes
            WHERE user_id = %s
            """,
            [user_id],
        )

    @staticmethod
    def validate_and_consume(qr_code, scanner_id=None, ip_address=None, user_agent=None):
        consumed = fetch_one(
            """
            UPDATE qr_codes qc
            SET status = 'used',
                used_at = CURRENT_TIMESTAMP,
                scanned_by = COALESCE(%s, qc.scanned_by)
            FROM users u
            WHERE qc.qr_code = %s::uuid
              AND qc.user_id = u.id
              AND qc.status = 'active'
              AND qc.expires_at > NOW()
            RETURNING qc.id, qc.user_id, qc.qr_code, qc.expires_at, qc.generated_at, u.full_name, u.email
            """,
            [scanner_id, qr_code],
        )

        if consumed:
            QRModel._log_scan(consumed["id"], scanner_id, "used", ip_address, user_agent)
            return {
                "valid": True,
                "reason": None,
                "user": {"name": consumed["full_name"], "email": consumed["email"]},
                "scanned_at": QRModel._now().isoformat(),
            }

        row = fetch_one(
            "SELECT id, status, expires_at FROM qr_codes WHERE qr_code = %s::uuid",
            [qr_code],
        )
        if not row:
            QRModel._log_scan(None, scanner_id, "not_found", ip_address, user_agent)
            return {"valid": False, "reason": "not_found"}

        status = row["status"]
        expires_at = row["expires_at"]
        if status == "used":
            QRModel._log_scan(row["id"], scanner_id, "already_used", ip_address, user_agent)
            return {"valid": False, "reason": "already_used"}

        now = QRModel._now()
        if status == "active" and expires_at.replace(tzinfo=timezone.utc) <= now:
            QRModel.mark_expired(row["id"])
            QRModel._log_scan(row["id"], scanner_id, "expired", ip_address, user_agent)
            return {"valid": False, "reason": "expired"}

        if status == "expired":
            QRModel._log_scan(row["id"], scanner_id, "expired", ip_address, user_agent)
            return {"valid": False, "reason": "expired"}

        QRModel._log_scan(row["id"], scanner_id, "already_used", ip_address, user_agent)
        return {"valid": False, "reason": "already_used"}

    @staticmethod
    def _log_scan(qr_code_id, scanner_id, scan_result, ip_address, user_agent):
        execute(
            """
            INSERT INTO scan_logs (qr_code_id, scanner_id, scan_result, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s)
            """,
            [qr_code_id, scanner_id, scan_result, ip_address, user_agent],
        )
