import matplotlib
import requests
import PIL
from flask import Flask, send_file, request
import io
import json
import math
import threading
import os

sessions = {}

def texttoimg(text, res = 32):
    buf = io.BytesIO()
    im = PIL.Image.new(mode="RGB", size=(res, res))
    pm = im.load() 

    c = 0
    for y in range(res):
        for x in range(res):
            if(c < len(text)):
                px = ord(text[c])
                pm[x,y] = (px, px, px)
            else:
                pm[x,y] = (0,0,255) #blue end pixels.
            c+=1

    im = im.resize((res,res), resample=PIL.Image.BOX)
    im.save(buf, format="PNG")
    buf.seek(0)
    return buf

def sestoimg(sesID, res = 256):
    buf = io.BytesIO()
    im = PIL.Image.new(mode="RGB", size=(res, res))
    pm = im.load() 
    if(sesID in sessions):
        if(sessions[sesID]["status"] == "downloading"):
            for y in range(res):
                for x in range(res):
                    pm[x,y] = (0,255,0) #green pre-content pixels.

        if(sessions[sesID]["status"] == "finish"):
            send = sessions[sesID]["content"][:res*res] #sending the first res bytes of data.
            c=0
            for y in range(res):
                for x in range(res):
                    if(c < len(send)):
                        px = ord(send[c])
                        pm[x,y] = (px, px, px)
                    else:
                        pm[x,y] = (0,0,255) #blue end pixels.
                    c+=1
            sessions[sesID]["content"] = sessions[sesID]["content"][res*res:] #removing sent data from session
            if(len(sessions[sesID]["content"]) == 0):
                del sessions[sesID]

        im = im.resize((res,res), resample=PIL.Image.BOX)
        im.save(buf, format="PNG")
        buf.seek(0)
        return buf
    return ""



app = Flask(__name__)

def start_request(data):
    global sessions
    if(sessions[data["sesID"]]["status"] == "downloading"):
        if(data["method"] == "GET"):
            sessions[data["sesID"]]["content"] = requests.get(url = data["url"], params=data["data"], headers=data["headers"]).text
        if(data["method"] == "POST"):
            sessions[data["sesID"]]["content"] = requests.post(url = data["url"], data=data["data"], headers=data["headers"]).text
        print("download obtained.")
        sessions[data["sesID"]]["status"] = "finish"
        print(sessions)

@app.route('/packetinit', methods=['GET'])
def packetinit():
    if request.method == 'GET': 
        data = json.loads(bytes.fromhex(request.args['data']).decode("ASCII"))
        pid = os.urandom(15).hex()
        sessions[pid] = {"status": "downloading", "content": []}
        print(pid)
        threading.Thread(target=start_request, args=({"url": data["url"], "sesID": pid, "data": data["data"], "headers": data["headers"], "method": data["method"]},)).start()
        return send_file(texttoimg( #sending info to server
            json.dumps({
                "sysres": 256,
                "pid": pid
            })
        ), download_name="image.png")


@app.route('/packetcheck', methods=['GET'])
def packetcheck():        
    if request.method == 'GET': 
        return send_file(sestoimg(request.args['sesID']), download_name="image.png")

if __name__ == '__main__':
    app.run(port=5123)