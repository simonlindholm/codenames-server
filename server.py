from flask import *
# from flask_compress import Compress
from subprocess import Popen, PIPE
import json

app = Flask(__name__)

class ApiError(Exception):

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code or 200
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['status'] = 0
        rv['message'] = self.message
        return rv

@app.errorhandler(ApiError)
def handle_api_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

@app.route("/api/1/clue")
def clueAPI():
    def arg(id, default=None, type=None):
        if not id in request.args:
            raise ApiError("Missing parameter " + str(id))
        return request.args.get(id, default=default, type=type)
    engine = arg('engine')
    color = arg('color')
    colors = arg('colors')
    words = arg('words').replace(' ', '_').split(',')
    index = arg('index', -1, int)
    count = arg('count', -1, int)
    if len(colors) != len(words):
        raise ApiError("colors and words have different lengths")
    if color not in "rb" or any(col not in "rbca" for col in colors):
        raise ApiError("invalid colors")

    inp = engine + ' ' + color + '\n'
    inp += '\n'.join(c + ' ' + w for (c, w) in zip(colors, words)) + '\n'
    inp += 'go ' + str(index) + ' ' + str(count) + '\n'

    proc = Popen(['./codenames', '--batch'], stdin=PIPE, stdout=PIPE, cwd='./Codenames')
    outp = proc.communicate(inp.encode())[0]

    resp = Response(outp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Content-type'] = 'application/json'
    return resp

@app.route("/<path:path>")
def statics(path):
    return send_from_directory('static', path)

@app.route("/")
def main():
    return send_file('static/index.html')

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)
