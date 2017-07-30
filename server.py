from flask import *
# from flask_compress import Compress
from subprocess import Popen, PIPE
import os
import json
import uuid
import shutil
import recognizer.board
import recognizer.grid

UPLOAD_FOLDER = '/tmp/codenames-upload'
PASSWORD = os.environ.get('PASSWORD')
last_ocr_board_filename = UPLOAD_FOLDER + '/last-ocr-board.jpg'
last_ocr_grid_filename = UPLOAD_FOLDER + '/last-ocr-grid.jpg'

if not os.path.isdir(UPLOAD_FOLDER):
    os.mkdir(UPLOAD_FOLDER)
    os.chmod(UPLOAD_FOLDER, 0o777)

if not os.path.isfile(last_ocr_board_filename):
    open(last_ocr_board_filename, 'w').close()
    open(last_ocr_grid_filename, 'w').close()
    os.chmod(last_ocr_board_filename, 0o777)
    os.chmod(last_ocr_grid_filename, 0o777)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
    resp = jsonify(error.to_dict())
    resp.status_code = error.status_code
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

def arg(id, default=None, type=None):
    if not id in request.values:
        raise ApiError("Missing parameter " + str(id))
    return request.values.get(id, default=default, type=type)

def split_words(s):
    return list(filter(lambda x: x != "", s.replace(' ', '_').split(',')))

@app.route("/api/1/clue")
def clueAPI():
    engine = arg('engine')
    color = arg('color')
    colors = arg('colors')
    inappropriate = arg('inappropriate')
    words = split_words(arg('words'))
    hintedWords = split_words(arg('hinted_words'))
    oldClues = split_words(arg('old_clues'))
    difficulty = arg('difficulty')
    index = arg('index', -1, int)
    count = arg('count', -1, int)
    if len(colors) != len(words):
        raise ApiError("colors and words have different lengths")
    if color not in "rb" or any(col not in "rbca" for col in colors):
        raise ApiError("invalid colors")
    if difficulty not in ["easy", "medium", "hard"]:
        raise ApiError("invalid difficulty")
    if inappropriate not in ["block", "allow", "boost"]:
        raise ApiError("inappropriate inappropriateness")

    inp = engine + ' ' + color + '\n'
    inp += '\n'.join(c + ' ' + w for (c, w) in zip(colors, words)) + '\n'
    for w in hintedWords:
        inp += 'hinted ' + w + '\n'
    for w in oldClues:
        inp += 'clue ' + w + '\n'
    inp += 'difficulty ' + str(difficulty) + '\n'
    inp += 'inappropriate ' + str(inappropriate) + '\n'
    inp += 'go ' + str(index) + ' ' + str(count) + '\n'

    proc = Popen(['./codenames', '--batch'], stdin=PIPE, stdout=PIPE, cwd='./bot')
    outp = proc.communicate(inp.encode())[0]

    resp = Response(outp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Content-type'] = 'application/json'
    return resp

@app.route("/api/1/ocr-board", methods=['POST'])
def ocrBoard():
    size = arg('size')
    lang = arg('lang')
    if size != '5x5':
        raise ApiError("Only size 5x5 supported right now")
    if lang not in ['eng', 'swe']:
        raise ApiError("Only English and Swedish supported right now")
    if not 'file' in request.files:
        raise ApiError("Missing parameter file")
    file = request.files['file']
    if not file.filename.lower().endswith('.jpg') and not file.filename.lower().endswith('.jpeg'):
        raise ApiError("File must have a .jpg extension")

    tmpname = str(uuid.uuid4()) + '.jpg'
    fname = os.path.join(app.config['UPLOAD_FOLDER'], tmpname)
    file.save(fname)
    shutil.copy(fname, last_ocr_board_filename)
    os.chmod(last_ocr_board_filename, 0o777)

    words, grid = recognizer.board.find_words(fname, lang)

    # (In case of exceptions, don't remove the file)
    os.remove(fname)

    resp = jsonify({'status': 1, 'message': "Success.", 'grid': grid})
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route("/api/1/ocr-grid", methods=['POST'])
def ocrGrid():
    size = arg('size')
    if size != '5x5':
        raise ApiError("Only size 5x5 supported right now")
    if not 'file' in request.files:
        raise ApiError("Missing parameter file")
    file = request.files['file']
    if not file.filename.lower().endswith('.jpg') and not file.filename.lower().endswith('.jpeg'):
        raise ApiError("File must have a .jpg extension")

    tmpname = str(uuid.uuid4()) + '.jpg'
    fname = os.path.join(app.config['UPLOAD_FOLDER'], tmpname)
    file.save(fname)
    shutil.copy(fname, last_ocr_grid_filename)
    os.chmod(last_ocr_grid_filename, 0o777)

    grid = recognizer.grid.find_grid(fname)

    # (In case of exceptions, don't remove the file)
    os.remove(fname)

    if grid is None:
        resp = jsonify({'status': 2, 'message': "No grid found!"})
    else:
        resp = jsonify({'status': 1, 'message': "Success.", 'grid': grid})
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp

@app.route("/last-board.jpg")
def lastOcrBoard():
    if request.values.get('pw', default='') != PASSWORD:
        return '', 401
    return send_file(last_ocr_board_filename)

@app.route("/last-grid.jpg")
def lastOcrGrid():
    if request.values.get('pw', default='') != PASSWORD:
        return '', 401
    return send_file(last_ocr_grid_filename)

@app.route("/<path:path>")
def statics(path):
    return send_from_directory('static', path)

@app.route("/")
def main():
    return send_file('static/index.html')

if __name__ == "__main__":
    app.run(host='localhost', port=10000)
