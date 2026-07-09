"""Simple HTTP server that serves the robots.txt file."""

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler


class RobotsTxtHandler(SimpleHTTPRequestHandler):
    """Custom handler that serves robots.txt from the project root."""

    def do_GET(self):
        if self.path == "/robots.txt":
            robots_path = os.path.join(os.path.dirname(__file__), "robots.txt")
            try:
                with open(robots_path, "r") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/plain")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content.encode("utf-8"))
            except FileNotFoundError:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b"Not Found")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not Found")


def create_server(host="localhost", port=8000):
    """Create and return an HTTPServer instance."""
    server = HTTPServer((host, port), RobotsTxtHandler)
    return server


def run_server(host="localhost", port=None):
    """Run the server (blocking)."""
    if port is None:
        port = int(os.environ.get("PORT", 8000))
    server = create_server(host, port)
    print(f"Serving on http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
