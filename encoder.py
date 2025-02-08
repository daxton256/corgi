import requests
import PIL
from flask import Flask, send_file, request
import io
import json

def texttoimg(strin):
    buf = io.BytesIO()
    im = PIL.Image.new(mode="RGB", size=(100, 100))
    pm = im.load() 
    rv = [] #list of ascii values

    for i in range(len(strin)):
        rv.append(ord(strin[i])) #appends ASCII values to real values list

    c=0
    for y in range(100):
        for x in range(100):
            px = rv[c] if c < len(rv) else 0
            pm[x,y] = (px, px, px)
            c+=1
    im = im.resize((100,100), resample=PIL.Image.BOX)

    im.save(buf, format="PNG")
    buf.seek(0)
    return buf




app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():        
    if request.method == 'GET': #code.org will always send GET requests
        data = json.loads(request.args['data'])
        headers = json.loads(request.args['headers'])
        method = json.loads(request.args['method'])
        url = json.loads(request.args['url'])
        if(method == 'GET'):
            return send_file(texttoimg(
                requests.get(url = url, params=data, headers=headers).text
            ), download_name="image.png")
        if(method == 'POST'):
            return send_file(texttoimg(
                requests.post(url = url, data=data, headers=headers).text
            ), download_name="image.png")

if __name__ == '__main__':
    app.run(port=5123)