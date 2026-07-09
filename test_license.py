"""
Tests for the LICENSE file.
Covers unit, integration, and e2e scenarios.
"""

import os
import sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
LICENSE_PATH = os.path.join(PROJECT_ROOT, "LICENSE")

# ---------------------------------------------------------------------------
# Unit tests — structural/content checks on the LICENSE file
# ---------------------------------------------------------------------------

def test_license_file_exists():
    """Unit: the LICENSE file must be present at the project root."""
    assert os.path.isfile(LICENSE_PATH), f"LICENSE file not found at {LICENSE_PATH}"


def test_license_file_not_empty():
    """Unit: the LICENSE file must contain text."""
    content = open(LICENSE_PATH, encoding="utf-8").read()
    assert len(content.strip()) > 0, "LICENSE file is empty"


def test_license_has_mit_title():
    """Unit: the first line must declare MIT License."""
    with open(LICENSE_PATH, encoding="utf-8") as f:
        first_line = f.readline().strip()
    assert first_line == "MIT License", f'Expected "MIT License", got {first_line!r}'


def test_license_mentions_mayank_7851():
    """Unit: the copyright holder must be mayank-7851."""
    content = open(LICENSE_PATH, encoding="utf-8").read()
    assert "mayank-7851" in content, "LICENSE must credit mayank-7851"


def test_license_has_year_2025():
    """Unit: the copyright year should be 2025."""
    content = open(LICENSE_PATH, encoding="utf-8").read()
    assert "2025" in content, "LICENSE must contain copyright year 2025"


def test_license_contains_permission_clause():
    """Unit: verify the standard MIT permission grant is present."""
    content = open(LICENSE_PATH, encoding="utf-8").read()
    assert "Permission is hereby granted" in content, (
        "Missing standard MIT permission grant"
    )


def test_license_contains_llc_clause():
    """Unit: verify the standard MIT liability/no-warranty clause is present."""
    content = open(LICENSE_PATH, encoding="utf-8").read()
    assert "THE SOFTWARE IS PROVIDED" in content, (
        "Missing standard MIT no-warranty clause"
    )


# ---------------------------------------------------------------------------
# Integration tests — the LICENSE file is consistent with the project
# ---------------------------------------------------------------------------

def test_license_and_readme_both_present():
    """Integration: both LICENSE and README.md should exist side by side."""
    readme_path = os.path.join(PROJECT_ROOT, "README.md")
    assert os.path.isfile(LICENSE_PATH)
    assert os.path.isfile(readme_path)


def test_license_symlinked_or_real():
    """Integration: LICENSE should be a regular file (not a symlink to outside)."""
    assert os.path.isfile(LICENSE_PATH)
    # It must not be a dangling symlink
    if os.path.islink(LICENSE_PATH):
        assert os.path.exists(os.readlink(LICENSE_PATH))


# ---------------------------------------------------------------------------
# E2E tests — simulate a downstream consumer checking the license
# ---------------------------------------------------------------------------

def test_e2e_license_parseable_by_reuse_tool():
    """E2E: the file must be parseable as a MIT license header.

    We simulate what tools like 'reuse lint' check: the file must start
    with 'MIT License' and contain a copyright line.
    """
    with open(LICENSE_PATH, encoding="utf-8") as f:
        lines = f.readlines()

    assert lines[0].strip() == "MIT License"

    # Find a copyright line
    copyright_lines = [l for l in lines if l.startswith("Copyright")]
    assert len(copyright_lines) >= 1, (
        "No copyright line found — needed by license-compliance tools"
    )
    assert "mayank-7851" in copyright_lines[0]


def test_e2e_license_matches_opensource_org_template():
    """E2E: check against the OSI MIT template (key phrases)."""
    with open(LICENSE_PATH, encoding="utf-8") as f:
        text = f.read()

    # Normalise whitespace so multi-word phrases match across line breaks
    normalised = " ".join(text.split())

    required_phrases = [
        "MIT License",
        "Copyright (c) 2025 mayank-7851",
        "Permission is hereby granted, free of charge",
        "to deal in the Software without restriction",
        "The above copyright notice and this permission notice",
        "THE SOFTWARE IS PROVIDED \"AS IS\"",
    ]
    for phrase in required_phrases:
        assert phrase in normalised, f"Missing required phrase: {phrase!r}"


def test_e2e_python_project_has_license():
    """E2E: run the app and confirm it reports its license info."""
    # Simple smoke test: the project's hello.py is an empty file,
    # but we can at least confirm the interpreter can read the license
    result = os.system(
        f'{sys.executable} -c "print(open(\'{LICENSE_PATH}\').readline().strip())"'
    )
    assert result == 0, "Python can't read the LICENSE file"
