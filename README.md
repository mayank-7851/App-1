# Login Flow

A minimal Flask-based authentication service with email/password signup and login.

## Endpoints

| Method | Path        | Description                        |
|--------|-------------|------------------------------------|
| POST   | `/signup`   | Create a new user account          |
| POST   | `/login`    | Authenticate and receive a JWT     |
| GET    | `/me`       | Get current user info (Bearer auth) |

## Quick start

```bash
pip install -r requirements.txt
python app.py
```

## Running tests

```bash
# With pytest (preferred)
pip install pytest
python -m pytest test_auth.py -v

# Or with the built-in runner
python test_auth.py
```
