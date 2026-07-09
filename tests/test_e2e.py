"""End-to-end tests: start the real server, make actual HTTP requests to /robots.txt."""

import os
import subprocess
import sys
import time
import unittest
import urllib.request
from urllib.error import URLError


class TestRobotsTxtE2E(unittest.TestCase):
    """E2E tests that spin up the actual server process."""

    @classmethod
    def setUpClass(cls):
        """Start the real server as a subprocess on a specific port."""
        cls.port = 9876
        cls.server_process = subprocess.Popen(
            [sys.executable, "app.py"],
            env={**os.environ, "PORT": str(cls.port)},
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        # Wait for the server to start
        cls._wait_for_server(cls.port, timeout=5)

    @classmethod
    def _wait_for_server(cls, port, timeout=5):
        """Poll until the server is ready."""
        start = time.time()
        while time.time() - start < timeout:
            try:
                urllib.request.urlopen(f"http://localhost:{port}/robots.txt")
                return
            except URLError:
                time.sleep(0.2)
        raise RuntimeError(f"Server did not start on port {port} within {timeout}s")

    @classmethod
    def tearDownClass(cls):
        """Kill the server process."""
        if cls.server_process.poll() is None:
            cls.server_process.terminate()
            cls.server_process.wait(timeout=3)

    def test_robots_txt_returns_200(self):
        """E2E: GET /robots.txt returns HTTP 200."""
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        self.assertEqual(resp.status, 200)

    def test_robots_txt_content_type(self):
        """E2E: Content-Type is text/plain."""
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        self.assertEqual(resp.headers.get("Content-Type"), "text/plain")

    def test_robots_txt_body(self):
        """E2E: response body is exactly the contents of robots.txt."""
        resp = urllib.request.urlopen(f"http://localhost:{self.port}/robots.txt")
        body = resp.read().decode("utf-8")

        robots_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "robots.txt")
        with open(robots_path, "r") as f:
            expected = f.read()

        self.assertEqual(body, expected)

    def test_unknown_path_returns_404(self):
        """E2E: GET /anything-else returns 404."""
        from urllib.error import HTTPError
        with self.assertRaises(HTTPError) as ctx:
            urllib.request.urlopen(f"http://localhost:{self.port}/nope")
        self.assertEqual(ctx.exception.code, 404)


if __name__ == "__main__":
    unittest.main()
