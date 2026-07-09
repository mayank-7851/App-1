"""Integration tests: server endpoint returns correct response for /robots.txt."""

import os
import unittest
from http.server import HTTPServer
from threading import Thread

from app import RobotsTxtHandler


class TestRobotsTxtEndpoint(unittest.TestCase):
    """Tests that the server handler correctly serves robots.txt."""

    @classmethod
    def setUpClass(cls):
        """Start a server on a random port for testing."""
        cls.server = HTTPServer(("localhost", 0), RobotsTxtHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        """Shut down the server."""
        cls.server.shutdown()
        cls.server.server_close()

    def test_returns_200(self):
        """Integration: GET /robots.txt returns 200 OK."""
        import urllib.request
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        self.assertEqual(resp.status, 200)

    def test_content_type_is_text_plain(self):
        """Integration: Content-Type must be text/plain."""
        import urllib.request
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        self.assertEqual(resp.headers.get("Content-Type"), "text/plain")

    def test_body_contains_user_agent_all(self):
        """Integration: response body contains User-agent: *."""
        import urllib.request
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        body = resp.read().decode("utf-8")
        self.assertIn("User-agent: *", body)

    def test_body_contains_allow_all(self):
        """Integration: response body contains Allow: /."""
        import urllib.request
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        body = resp.read().decode("utf-8")
        self.assertIn("Allow: /", body)

    def test_404_for_other_paths(self):
        """Integration: GET /other returns 404."""
        import urllib.request
        from urllib.error import HTTPError
        with self.assertRaises(HTTPError) as ctx:
            urllib.request.urlopen(f"http://localhost:{self.port}/some-other-path")
        self.assertEqual(ctx.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
