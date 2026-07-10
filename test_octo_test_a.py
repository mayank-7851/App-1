"""
Tests for the octo-test-a.txt file.
Covers unit, integration, and e2e scenarios.
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(PROJECT_ROOT, "octo-test-a.txt")

# ---------------------------------------------------------------------------
# Unit tests — structural/content checks on the octo-test-a.txt file
# ---------------------------------------------------------------------------

def test_file_exists():
    """Unit: the octo-test-a.txt file must be present at the project root."""
    assert os.path.isfile(FILE_PATH), f"octo-test-a.txt not found at {FILE_PATH}"


def test_file_not_empty():
    """Unit: the octo-test-a.txt file must contain text."""
    content = open(FILE_PATH, encoding="utf-8").read()
    assert len(content.strip()) > 0, "octo-test-a.txt is empty"


def test_file_is_exactly_one_line():
    """Unit: the file must contain exactly one line (no extra newlines)."""
    with open(FILE_PATH, encoding="utf-8") as f:
        lines = f.readlines()
    # Allow a trailing newline (single line with newline → 1 element)
    assert len(lines) == 1, f"Expected exactly 1 line, got {len(lines)}"


def test_file_contains_expected_text():
    """Unit: the file must contain the exact phrase 'parallel dispatch test A'."""
    content = open(FILE_PATH, encoding="utf-8").read()
    assert "parallel dispatch test A" in content, (
        "octo-test-a.txt does not contain the expected text"
    )


def test_file_content_is_exact():
    """Unit: the stripped content must be exactly 'parallel dispatch test A'."""
    content = open(FILE_PATH, encoding="utf-8").read().strip()
    assert content == "parallel dispatch test A", (
        f"Expected 'parallel dispatch test A', got {content!r}"
    )


def test_file_no_trailing_whitespace():
    """Unit: the file must not have trailing whitespace on the content line."""
    content = open(FILE_PATH, encoding="utf-8").read()
    # The line should end with 'A' (optionally followed by a single newline)
    stripped = content.rstrip("\n")
    assert stripped == "parallel dispatch test A", (
        f"Unexpected trailing characters: {stripped!r}"
    )


# ---------------------------------------------------------------------------
# Integration tests — the file is consistent with the project
# ---------------------------------------------------------------------------

def test_file_and_readme_both_present():
    """Integration: both octo-test-a.txt and README.md exist side by side."""
    readme_path = os.path.join(PROJECT_ROOT, "README.md")
    assert os.path.isfile(FILE_PATH)
    assert os.path.isfile(readme_path)


def test_file_is_regular_not_symlink():
    """Integration: octo-test-a.txt should be a regular file."""
    assert os.path.isfile(FILE_PATH)
    if os.path.islink(FILE_PATH):
        assert os.path.exists(os.readlink(FILE_PATH))


def test_file_size_reasonable():
    """Integration: the file size should be small (less than 100 bytes)."""
    size = os.path.getsize(FILE_PATH)
    assert size > 0, "File is empty"
    assert size < 100, f"File too large: {size} bytes"


# ---------------------------------------------------------------------------
# E2E tests — simulate a downstream consumer reading the file
# ---------------------------------------------------------------------------

def test_e2e_python_can_read_file():
    """E2E: Python must be able to open and read the file."""
    result = os.system(
        f'{sys.executable} -c "'
        f'with open(\'{FILE_PATH}\') as f: print(f.read().strip())'
        f'"'
    )
    assert result == 0, "Python cannot read octo-test-a.txt"


def test_e2e_content_matches_expected_output():
    """E2E: reading the file via a subprocess yields the correct output."""
    import subprocess
    proc = subprocess.run(
        [sys.executable, "-c",
         f"with open('{FILE_PATH}') as f: print(f.read(), end='')"],
        capture_output=True, text=True
    )
    assert proc.returncode == 0
    assert proc.stdout == "parallel dispatch test A\n", (
        f"Unexpected output: {proc.stdout!r}"
    )


def test_e2e_file_is_utf8():
    """E2E: the file must be valid UTF-8."""
    with open(FILE_PATH, encoding="utf-8") as f:
        f.read()  # would raise UnicodeDecodeError if not valid UTF-8
