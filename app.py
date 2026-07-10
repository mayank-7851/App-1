"""
Flask app exposing signup and login endpoints.

Endpoints
---------
POST /signup   —  {"email": "...", "password": "..."}  →  201 + token
POST /login    —  {"email": "...", "password": "..."}  →  200 + token
GET  /me       —  Authorization: Bearer <token>         →  200 + user info
"""

import re
from flask import Flask, request, jsonify

from auth_utils import hash_password, check_password, create_token, decode_token
from db import create_user, get_user_by_email, delete_all_users

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_signup(email: str, password: str):
    """Return an error string, or None if valid."""
    if not email or not password:
        return "Email and password are required"
    if not _EMAIL_RE.match(email):
        return "Invalid email format"
    if len(password) < 6:
        return "Password must be at least 6 characters"
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.route("/signup", methods=["POST"])
def signup():
    """Create a new user account.  Returns a JWT on success."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    error = _validate_signup(email, password)
    if error:
        return jsonify({"error": error}), 400

    try:
        hashed = hash_password(password)
        user = create_user(email, hashed)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 409

    token = create_token(user["id"], email)
    return jsonify({"token": token, "user": {"id": user["id"], "email": email}}), 201


@app.route("/login", methods=["POST"])
def login():
    """Authenticate with email + password.  Returns a JWT on success."""
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = get_user_by_email(email)
    if user is None or not check_password(password, user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_token(user["id"], email)
    return jsonify({"token": token, "user": {"id": user["id"], "email": email}}), 200


@app.route("/me", methods=["GET"])
def me():
    """Return the current user's info (requires a valid Bearer token)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header[len("Bearer "):]
    payload = decode_token(token)
    if payload is None:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({"user": {"id": int(payload["sub"]), "email": payload["email"]}}), 200


# ---------------------------------------------------------------------------
# Convenience — reset the user DB (for testing)
# ---------------------------------------------------------------------------


@app.route("/__reset", methods=["POST"])
def reset():
    """Delete all users (testing helper)."""
    delete_all_users()
    return jsonify({"ok": True}), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
