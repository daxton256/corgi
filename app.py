import matplotlib
import requests
import PIL
from flask import Flask, send_file, request
import io
import json
import math

def texttoimg(strin):
    rv = [] #list of ascii values
    res = 765
    #appends ASCII values to real values list
    if(len(strin) < res**2):
        for i in range(len(strin)):
            rv.append(ord(strin[i]))
    else:
        for i in range(len("response too large.")):
            rv.append(ord("response too large."[i])) #there is a better way to do this, but i have not optimised yet.

    buf = io.BytesIO()
    im = PIL.Image.new(mode="RGB", size=(res, res))
    pm = im.load() 

    c=0
    for y in range(res):
        for x in range(res):
            if(c < len(rv)):
                px = rv[c]
                pm[x,y] = (px, px, px)
            else:
                pm[x,y] = (0,0,255) #blue end pixels
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