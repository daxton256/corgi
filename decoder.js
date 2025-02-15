// a function that generates a random string
// length {int} - how long the random string should be
// return {string} - the random string
function randomString(length) {
  var st = "";
  for(var i = 0; i < length; i++) {
    st += String.fromCharCode(randomNumber(65,90));
  }
  return st;
}

// a function that encodes strings into hexadecimal format.
// string {string} - the string to be encoded
// return {string} - the encoded hex string
function encodeHex(string) {
  var hex = "";
  for(var c = 0; c < string.length; c++){
    hex += string.charCodeAt(c).toString(16); //convert char to hex
  }
  return hex;
}

//make a template string to easily include variables and other data in a string.
//string {string} - the string to use with the template. to insert variables use ^^<var index>^^ eg. (^^1^^)
//items {list} - a list of items to use within the template.
//return {string} - the returned string with all filled elements.
function templateString(string, items) {
  var filled = string;
  for(var item in items){
    filled = filled.split("^^" + item + "^^").join(items[item]); //splitting the string by any occurences of the current index, then joining it back together with the list[index]'s content.
  }
  return filled;
}
//onload {function(data)} - the function to be executed when the server responds. 
//url {string} - the url of the server to grab
//method {string (strictly "GET" or "POST")} - the REST method to use when talking to the server.
//data {Object or String} - The data to send to the server.
//headers {Object} - The headers to use when connecting to the server.
function srvHTTP(onload, url, method, data, headers, verbose) {
  var st = Date.now();
  var proxyServer = "https://dbhs.dev/river";
  if(verbose) { console.log("Using " + proxyServer); }
  function packetContent(url, packetSize, finish) {
    var imgID = randomString(16);
    var canvasID = randomString(16);
    
    createCanvas(canvasID, packetSize, packetSize); //creating packet data retrieval canvas.
    hideElement(canvasID); //hiding packet data retrieval canvas.
    setActiveCanvas(canvasID); //setting packet retrieval canvas to the main canvas.
    
    image(imgID, url); //downloading the packet image
    hideElement(imgID); //hiding packet image
    
    var loadChecker = setInterval(function(){
      drawImage(imgID, 0, 0, packetSize, packetSize); //putting this in a try function still throws an error if the image is invalid, issue on code.org's end.
      if(getImageData(packetSize - 1, packetSize - 1, 1, 1).data[3] != 0){ //is image fully loaded?
          if(verbose) {console.log("image loaded..");}
          clearInterval(loadChecker);
          var fullData = getImageData(0, 0, packetSize, packetSize);
          var packetData = "";
          var finished = false;
          for(var p = 4; p < fullData.data.length; p+=4) {
            if(fullData.data[p-3] == 255 && fullData.data[p-4] == 0) { //green pixel indicates data is not ready
              finish({"stat": "fetching", "data": ""}); //this status indicates that the server is still fetching the data.
              finished = true;
              break;
            } else if(fullData.data[p-2] == 255 && fullData.data[p-3] == 0){ //blue pixel indicates end of request data.
              finish({"stat": "stopped", "data": packetData});
              finished = true;
              break;
            } else {
              packetData += String.fromCharCode(fullData.data[p-2]); //adding ASCII char if no special code specified
            }
          }
          if(!finished) { finish({"stat": "got", "data": packetData}); } //returning received data if no special codes were found throughout the image.
          //cleanup
          deleteElement(canvasID);
          deleteElement(imgID);
      }
    }, 10);
  }
  
  var finalData = ""; //final data to be given to onfinish
  
  //initial handshake with server to get packet ID and response image resoultion 
  //standard handshake pixel size is 32
  if(verbose) {console.log("starting handshake...");}
  packetContent(proxyServer + "/packetinit?data=" + encodeHex(JSON.stringify({ //sending handshake data to server
    "url": url,
    "method": method,
    "data": data,
    "headers": headers
  })) + "&ac=" + randomString(16), 32, function(data){ //run when handshake completed
    
    data = JSON.parse(data.data);
    var contPacketSize = data.sysres; //resolution of server responses
    var sessionID = data.pid; //packet ID for request
    
    if(verbose) { console.log(templateString("server will give me a ^^0^^ x ^^0^^ image under the ID of ^^1^^", [contPacketSize, sessionID]));}
    if(verbose) {console.log("session initiated, begin packet requests.");}
    req();
    function req(){
      packetContent(proxyServer + "/packetcheck?sesID=" + sessionID + "&ac=" + randomString(16), contPacketSize, function(data){
        finalData += data.data;
        if(data.stat != "stopped") {
          if(data.stat == "got" && verbose) { console.log("asking for next packet..."); }
          if(data.stat == "fetching" && verbose) { console.log("waiting for server to fetch data..."); }
          req(); //recursive!
        } else {
          if(verbose) {console.log("stop sequence found.");}
          var et = Date.now();
          if(verbose) {console.log("content fetched in " + (et - st) + "ms which is " + Math.round(finalData.length / (et - st)) + "bps");}
          onload(finalData);
        }
      });
    }
  });
}






