"""Unit tests: robots.txt file exists and has correct content."""

import os
import unittest


class TestRobotsTxtFile(unittest.TestCase):
    """Tests for the robots.txt file itself."""

    def setUp(self):
        self.robots_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "robots.txt")

    def test_file_exists(self):
        """Unit: robots.txt file must exist at project root."""
        self.assertTrue(os.path.isfile(self.robots_path), "robots.txt not found")

    def test_file_not_empty(self):
        """Unit: robots.txt must not be empty."""
        with open(self.robots_path, "r") as f:
            content = f.read().strip()
        self.assertTrue(len(content) > 0, "robots.txt is empty")

    def test_contains_user_agent_all(self):
        """Unit: robots.txt must contain User-agent: *."""
        with open(self.robots_path, "r") as f:
            content = f.read()
        self.assertIn("User-agent: *", content)

    def test_contains_allow_all(self):
        """Unit: robots.txt must contain Allow: /."""
        with open(self.robots_path, "r") as f:
            content = f.read()
        self.assertIn("Allow: /", content)

    def test_disallows_nothing(self):
        """Unit: robots.txt must NOT contain Disallow (allow all crawlers)."""
        with open(self.robots_path, "r") as f:
            content = f.read()
        self.assertNotIn("Disallow", content)


if __name__ == "__main__":
    unittest.main()
