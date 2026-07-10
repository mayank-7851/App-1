"""
Unit, integration, and end-to-end tests for the login/signup flow.

Run with:  python -m pytest test_auth.py -v
Or simply: python test_auth.py   (runs all tests with assert)
"""

import os
import sys
import json
import time

# Ensure the project root is on sys.path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

# ---------------------------------------------------------------------------
# Imports  (source under test)
# ---------------------------------------------------------------------------
from auth_utils import hash_password, check_password, create_token, decode_token
from db import create_user, get_user_by_email, delete_all_users, close_db

# We'll test the Flask app through its test client
from app import app

# ---------------------------------------------------------------------------
# Setup / teardown helpers
# ---------------------------------------------------------------------------

TEST_EMAIL = "alice@example.com"
TEST_PASSWORD = "secret123"


def setup_function():
    """Reset the DB before each test function."""
    delete_all_users()


def teardown_function():
    """Clean up after each test."""
    delete_all_users()


# ---------------------------------------------------------------------------
# UNIT TESTS  — auth_utils in isolation
# ---------------------------------------------------------------------------

def test_unit_hash_and_check_password():
    """Unit: hash_password produces a verifiable hash."""
    pw = "my-password!"
    hashed = hash_password(pw)
    # Format: algorithm$salt$hash
    parts = hashed.split("$")
    assert len(parts) == 3
    assert parts[0] == "pbkdf2_sha256"
    assert check_password(pw, hashed) is True
    assert check_password("wrong", hashed) is False


def test_unit_hash_different_salts():
    """Unit: two hashes of the same password are different (different salts)."""
    pw = "same-pass"
    h1 = hash_password(pw)
    h2 = hash_password(pw)
    assert h1 != h2
    assert check_password(pw, h1) is True
    assert check_password(pw, h2) is True


def test_unit_check_password_malformed_hash():
    """Unit: malformed stored hash returns False."""
    assert check_password("x", "") is False
    assert check_password("x", "not-enough-parts") is False
    assert check_password("x", "too$many$parts$here") is False


def test_unit_create_and_decode_token():
    """Unit: create_token returns a JWT that decode_token can parse."""
    token = create_token(user_id=42, email="bob@test.com")
    assert isinstance(token, str) and len(token) > 20
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "42"
    assert payload["email"] == "bob@test.com"
    assert "iat" in payload
    assert "exp" in payload


def test_unit_decode_invalid_token():
    """Unit: decode_token returns None for garbage or expired tokens."""
    assert decode_token("garbage-token") is None
    assert decode_token("") is None

    # Manually craft an expired token (set exp far in the past)
    import jwt as pyjwt
    expired = pyjwt.encode(
        {"sub": "1", "email": "x@x", "exp": int(time.time()) - 9999},
        "dev-secret-change-in-prod-0123456789abc",
        algorithm="HS256",
    )
    assert decode_token(expired) is None


# ---------------------------------------------------------------------------
# UNIT TESTS  — db helpers
# ---------------------------------------------------------------------------

def test_unit_create_and_get_user():
    """Unit: create_user stores a user; get_user_by_email retrieves it."""
    user = create_user(TEST_EMAIL, hash_password(TEST_PASSWORD))
    assert user["id"] > 0
    assert user["email"] == TEST_EMAIL

    row = get_user_by_email(TEST_EMAIL)
    assert row is not None
    assert row["email"] == TEST_EMAIL
    assert row["password"].startswith("pbkdf2_sha256$")


def test_unit_create_duplicate_email_raises():
    """Unit: creating a user with the same email raises ValueError."""
    create_user(TEST_EMAIL, hash_password(TEST_PASSWORD))
    try:
        create_user(TEST_EMAIL, hash_password("other-pass"))
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_unit_get_nonexistent_user():
    """Unit: get_user_by_email returns None for unknown email."""
    assert get_user_by_email("nobody@nowhere.com") is None


# ---------------------------------------------------------------------------
# INTEGRATION TESTS  — Flask endpoints with real DB
# ---------------------------------------------------------------------------

def _client():
    """Return a Flask test client."""
    app.config["TESTING"] = True
    return app.test_client()


def test_integration_signup_success():
    """Integration: POST /signup with valid data returns 201 + token."""
    client = _client()
    resp = client.post(
        "/signup",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "token" in data
    assert data["user"]["email"] == TEST_EMAIL
    assert data["user"]["id"] > 0


def test_integration_signup_duplicate_email():
    """Integration: POST /signup with existing email returns 409."""
    client = _client()
    client.post("/signup", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    resp = client.post("/signup", json={"email": TEST_EMAIL, "password": "newpass456"})
    assert resp.status_code == 409
    assert "already exists" in resp.get_json()["error"]


def test_integration_signup_validation():
    """Integration: POST /signup with bad data returns 400."""
    client = _client()

    # Missing email
    resp = client.post("/signup", json={"password": "123456"})
    assert resp.status_code == 400
    assert "required" in resp.get_json()["error"]

    # Missing password
    resp = client.post("/signup", json={"email": TEST_EMAIL})
    assert resp.status_code == 400

    # Bad email format
    resp = client.post("/signup", json={"email": "not-an-email", "password": "123456"})
    assert resp.status_code == 400
    assert "Invalid email" in resp.get_json()["error"]

    # Short password
    resp = client.post("/signup", json={"email": TEST_EMAIL, "password": "12345"})
    assert resp.status_code == 400
    assert "6 characters" in resp.get_json()["error"]


def test_integration_login_success():
    """Integration: POST /login with correct credentials returns 200 + token."""
    client = _client()
    # First signup
    client.post("/signup", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    # Then login
    resp = client.post("/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert resp.status_code == 200
    data = resp.get_json()
    assert "token" in data
    assert data["user"]["email"] == TEST_EMAIL


def test_integration_login_wrong_password():
    """Integration: POST /login with wrong password returns 401."""
    client = _client()
    client.post("/signup", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    resp = client.post("/login", json={"email": TEST_EMAIL, "password": "wrongpass"})
    assert resp.status_code == 401
    assert "Invalid" in resp.get_json()["error"]


def test_integration_login_nonexistent_user():
    """Integration: POST /login for unregistered email returns 401."""
    client = _client()
    resp = client.post("/login", json={"email": "ghost@test.com", "password": "pass123"})
    assert resp.status_code == 401


def test_integration_login_missing_fields():
    """Integration: POST /login with missing fields returns 400."""
    client = _client()
    resp = client.post("/login", json={})
    assert resp.status_code == 400


def test_integration_me_with_valid_token():
    """Integration: GET /me with a Bearer token returns the user."""
    client = _client()
    signup_resp = client.post(
        "/signup", json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    token = signup_resp.get_json()["token"]

    resp = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["user"]["email"] == TEST_EMAIL


def test_integration_me_no_token():
    """Integration: GET /me without a token returns 401."""
    client = _client()
    resp = client.get("/me")
    assert resp.status_code == 401


def test_integration_me_invalid_token():
    """Integration: GET /me with a bad token returns 401."""
    client = _client()
    resp = client.get("/me", headers={"Authorization": "Bearer bad-token"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# E2E TESTS  — simulated full user lifecycle
# ---------------------------------------------------------------------------

def test_e2e_signup_then_login_then_me():
    """E2E: A new user signs up, logs in, and fetches their profile."""
    client = _client()

    # 1. Signup
    signup_resp = client.post(
        "/signup",
        json={"email": "e2e-user@test.com", "password": "strong-pass-99"},
    )
    assert signup_resp.status_code == 201
    signup_data = signup_resp.get_json()
    assert signup_data["user"]["email"] == "e2e-user@test.com"

    # 2. Login with the same credentials
    login_resp = client.post(
        "/login",
        json={"email": "e2e-user@test.com", "password": "strong-pass-99"},
    )
    assert login_resp.status_code == 200
    login_data = login_resp.get_json()
    assert login_data["user"]["email"] == "e2e-user@test.com"
    token = login_data["token"]

    # 3. Use /me with the token
    me_resp = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.get_json()
    assert me_data["user"]["email"] == "e2e-user@test.com"

    # 4. Token from signup also works (same user)
    token2 = signup_data["token"]
    me_resp2 = client.get("/me", headers={"Authorization": f"Bearer {token2}"})
    assert me_resp2.status_code == 200


def test_e2e_rejected_login_before_signup():
    """E2E: Login fails for an account that has never been created."""
    client = _client()
    resp = client.post(
        "/login",
        json={"email": "never-signed-up@test.com", "password": "some-password"},
    )
    assert resp.status_code == 401


def test_e2e_multiple_users_isolated():
    """E2E: Two users can sign up and use separate tokens."""
    client = _client()

    # User A
    r1 = client.post("/signup", json={"email": "a@test.com", "password": "pass-a"})
    assert r1.status_code == 201
    token_a = r1.get_json()["token"]

    # User B
    r2 = client.post("/signup", json={"email": "b@test.com", "password": "pass-b"})
    assert r2.status_code == 201
    token_b = r2.get_json()["token"]

    # Each can access /me
    assert client.get("/me", headers={"Authorization": f"Bearer {token_a}"}).status_code == 200
    assert client.get("/me", headers={"Authorization": f"Bearer {token_b}"}).status_code == 200

    # Token A cannot see B's email
    me_a = client.get("/me", headers={"Authorization": f"Bearer {token_a}"}).get_json()
    assert me_a["user"]["email"] == "a@test.com"


# ---------------------------------------------------------------------------
# Test runner (direct execution)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Collect and run all test_* functions, report failures
    import types
    this_module = sys.modules[__name__]
    tests = [
        getattr(this_module, name)
        for name in dir(this_module)
        if name.startswith("test_") and isinstance(getattr(this_module, name), types.FunctionType)
    ]
    tests.sort(key=lambda f: f.__name__)

    passed = 0
    failed = 0
    for test_fn in tests:
        try:
            setup_function()
            test_fn()
            teardown_function()
            print(f"  PASS  {test_fn.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL  {test_fn.__name__}: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"  {passed} passed, {failed} failed out of {len(tests)} tests")
    if failed:
        sys.exit(1)
