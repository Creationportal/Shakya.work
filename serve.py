import http.server, os, sys

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Never cache during local dev so engine/JS changes are always picked up.
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.isfile(path):
            return super().do_GET()
        self.path = '/'
        return super().do_GET()

http.server.HTTPServer(('', int(sys.argv[1]) if len(sys.argv)>1 else 8000), SPAHandler).serve_forever()