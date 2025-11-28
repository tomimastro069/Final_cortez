#!/usr/bin/env python3
"""
Simple HTTP server for the frontend with API proxy
"""
import http.server
import socketserver
import os
import urllib.request
import urllib.error
import json

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
API_BASE_URL = 'http://localhost:8000'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Check if this is an API request
        if self.path.startswith('/api/'):
            self.proxy_api_request()
        else:
            super().do_GET()

    def proxy_api_request(self):
        """Proxy API requests to the backend to avoid CORS issues"""
        # Convert /api/ path to backend URL
        api_path = self.path.replace('/api/', '/', 1)
        backend_url = f"{API_BASE_URL}{api_path}"

        try:
            # Forward the request to the backend
            with urllib.request.urlopen(backend_url) as response:
                self.send_response(response.status)
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/json'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()

                # Copy the response body
                self.wfile.write(response.read())

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_data = {'error': f'API Error: {e.code}'}
            self.wfile.write(json.dumps(error_data).encode())

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            error_data = {'error': f'Proxy Error: {str(e)}'}
            self.wfile.write(json.dumps(error_data).encode())

    def end_headers(self):
        # Add CORS headers for static files
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving files from: {DIRECTORY}")
        print(f"API proxy enabled for {API_BASE_URL}")
        httpd.serve_forever()
