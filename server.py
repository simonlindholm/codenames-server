import http.server
import threading
import socketserver
import urllib
import json
import os
from subprocess import Popen, PIPE

class JSONError(Exception):
    pass

class Handler(http.server.SimpleHTTPRequestHandler):

    def handleClueAPI(self, params):
        try:
            engine = params['engine'][0]
            color = params['color'][0]
            colors = params['colors'][0]
            words = params['words'][0].replace(' ', '_').split(',')
            index = int(params['index'][0])
            count = int(params['count'][0])
            if len(colors) != len(words):
                raise JSONError("colors and words have different lengths")
            if color not in "rb" or any(col not in "rbca" for col in colors):
                raise JSONError("invalid colors")
            inp = engine + ' ' + color + '\n'
            inp += '\n'.join(c + ' ' + w for (c, w) in zip(colors, words)) + '\n'
            inp += 'go ' + str(index) + ' ' + str(count) + '\n'

            proc = Popen(['./codenames', '--batch'], stdin=PIPE, stdout=PIPE, cwd='./Codenames')
            outp = proc.communicate(inp.encode())[0]
            self.wfile.write(outp)
        except KeyError as e:
            raise JSONError("missing parameter: {}".format(e.args[0]))
        except ValueError:
            raise JSONError("cannot parse numeric parameter")

    def do_GET(self):
        path = urllib.parse.urlparse(self.path)
        if path.path == '/api/1/clue':
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            try:
                self.handleClueAPI(urllib.parse.parse_qs(path.query))
            except JSONError as e:
                self.wfile.write(json.dumps({"status": 0, "message": e.args[0]}).encode())
        else:
            return super().do_GET()

    def translate_path(self, path):
        ret = super().translate_path(path)
        start = os.getcwd()
        assert ret.startswith(start)
        return start + '/static' + ret[len(start):]

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    pass

print('Server listening on port 10000...')
ThreadedHTTPServer.allow_reuse_address = True
httpd = ThreadedHTTPServer(('', 10000), Handler)
httpd.serve_forever()
