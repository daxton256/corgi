import matplotlib
import PIL
from flask import Flask, send_file, request
import io
import json

def texttoimg(strin):
    buf = io.BytesIO()
    im = PIL.Image.new(mode="RGB", size=(100, 100))
    pm = im.load() 

    rv = []


    for i in range(len(strin)):
        rv.append(ord(strin[i])) #appends ASCII values to real values list

    c=0
    for y in range(100):
        for x in range(100):
            pm[x,y] = (rv[c] if c < len(rv) else 0, rv[c] if c < len(rv) else 0, rv[c] if c < len(rv) else 0)
            c += 1
    im = im.resize((100,100), resample=PIL.Image.BOX)
    im.save(buf, format="PNG")
    buf.seek(0)
    return buf




app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
    if request.method == 'GET':
        data = json.loads(request.args['data'])
        return send_file(texttoimg(json.dumps({"data": data, "celebrate": "yippergr"})), download_name="image.png")

if __name__ == '__main__':
    app.run()