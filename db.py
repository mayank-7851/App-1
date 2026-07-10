"""
SQLite-backed user store for the login/signup flow.
Uses Python's built-in sqlite3 — zero extra dependencies.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.db")


def _get_connection():
    """Return a connection (creates DB + tables on first call)."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            email       TEXT NOT NULL UNIQUE,
            password    TEXT NOT NULL,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.row_factory = sqlite3.Row
    return conn


def create_user(email: str, hashed_password: str) -> dict:
    """Insert a new user.  Raises ValueError on duplicate email."""
    conn = _get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, hashed_password),
        )
        conn.commit()
        return {"id": cur.lastrowid, "email": email}
    except sqlite3.IntegrityError:
        raise ValueError(f"User with email {email!r} already exists")
    finally:
        conn.close()


def get_user_by_email(email: str):
    """Return the user row as a sqlite3.Row, or None."""
    conn = _get_connection()
    try:
        return conn.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
    finally:
        conn.close()


def delete_all_users():
    """Truncate the users table (useful for testing)."""
    conn = _get_connection()
    try:
        conn.execute("DELETE FROM users")
        conn.commit()
    finally:
        conn.close()


def close_db():
    """Remove the database file (cleanup)."""
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
