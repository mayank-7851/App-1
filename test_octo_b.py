"""
Tests for octo-test-b.txt — parallel dispatch test B.
Covers unit, integration, and e2e scenarios.
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(PROJECT_ROOT, "octo-test-b.txt")


# ---------------------------------------------------------------------------
# Unit tests — structural/content checks on octo-test-b.txt
# ---------------------------------------------------------------------------

def test_unit_file_exists():
    """Unit: octo-test-b.txt must be present at the project root."""
    assert os.path.isfile(FILE_PATH), f"octo-test-b.txt not found at {FILE_PATH}"


def test_unit_file_has_exactly_one_line():
    """Unit: octo-test-b.txt must contain exactly one line."""
    with open(FILE_PATH, encoding="utf-8") as f:
        lines = f.readlines()
    assert len(lines) == 1, f"Expected exactly 1 line, got {len(lines)}"


def test_unit_file_content_exact_match():
    """Unit: octo-test-b.txt content must be exactly 'parallel dispatch test B'."""
    with open(FILE_PATH, encoding="utf-8") as f:
        content = f.read()
    # Content should be the required text plus a trailing newline
    assert content == "parallel dispatch test B\n", (
        f"Unexpected content: {content!r}"
    )


def test_unit_file_not_empty():
    """Unit: octo-test-b.txt must not be empty."""
    content = open(FILE_PATH, encoding="utf-8").read()
    assert len(content.strip()) > 0, "octo-test-b.txt is empty"


def test_unit_file_no_trailing_whitespace():
    """Unit: the single line must not have leading/trailing whitespace beyond the newline."""
    with open(FILE_PATH, encoding="utf-8") as f:
        line = f.readline()
    assert line.rstrip("\n") == "parallel dispatch test B", (
        f"Line has unexpected whitespace: {line!r}"
    )


# ---------------------------------------------------------------------------
# Integration tests — the file is consistent with the project
# ---------------------------------------------------------------------------

def test_integration_file_in_project_root():
    """Integration: octo-test-b.txt lives directly in the project root."""
    assert os.path.dirname(FILE_PATH) == PROJECT_ROOT, (
        "octo-test-b.txt must be in the project root"
    )


def test_integration_file_is_regular_file():
    """Integration: octo-test-b.txt should be a regular file, not a symlink or dir."""
    assert os.path.isfile(FILE_PATH)
    assert not os.path.islink(FILE_PATH)
    assert not os.path.isdir(FILE_PATH)


# ---------------------------------------------------------------------------
# E2E tests — simulate a downstream consumer reading the file
# ---------------------------------------------------------------------------

def test_e2e_file_readable_by_python():
    """E2E: Python must be able to open and read the file."""
    result = os.system(
        f'{sys.executable} -c "print(open(\'{FILE_PATH}\').readline().strip())"'
    )
    assert result == 0, "Python can't read octo-test-b.txt"


def test_e2e_file_encoding_is_utf8():
    """E2E: the file must be valid UTF-8."""
    with open(FILE_PATH, encoding="utf-8") as f:
        f.read()
    # If we got here without a UnicodeDecodeError, it's valid UTF-8
