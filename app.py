import matplotlib
import requests
import PIL
from flask import Flask, send_file, request
import io
import json
import math

def texttoimg(strin):
    rv = [] #list of ascii values
    #appends ASCII values to real values list
    for i in range(len(strin)):
        rv.append(ord(strin[i]))

    buf = io.BytesIO()
    res = math.ceil(math.sqrt(len(rv)))
    im = PIL.Image.new(mode="RGB", size=(res, res))
    pm = im.load() 
    
    c=0
    for y in range(res):
        for x in range(res):
            px = rv[c] if c < len(rv) else 0
            pm[x,y] = (px, px, px)
            c+=1
    im = im.resize((res,res), resample=PIL.Image.BOX)

    im.save(buf, format="PNG")
    buf.seek(0)
    return buf




app = Flask(__name__)
@app.route('/', methods=['GET'])
def hello_world():        
    print(request.headers)
    if request.method == 'GET': #code.org will always send GET requests
        data = json.loads(request.args['data'])
        headers = json.loads(request.args['headers'])
        method = request.args['method']
        url = request.args['url']
        if(method == 'GET'):
            return send_file(texttoimg(
                requests.get(url = url, params=data, headers=headers).text
            ), download_name="image.png")
        if(method == 'POST'):
            return send_file(texttoimg(
                requests.post(url = url, data=data, headers=headers).text
            ), download_name="image.png")

#if __name__ == '__main__':
    #app.run(port=5123)