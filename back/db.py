import os

import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DB_DATABASE"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        cursor_factory=RealDictCursor,
    )


def fetch_one(query, params=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or [])
            return cur.fetchone()


def fetch_all(query, params=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or [])
            return cur.fetchall()


def execute(query, params=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params or [])
