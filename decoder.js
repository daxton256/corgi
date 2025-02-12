
function randomString(length) {
  var st = "";
  for(var i = 0; i < length; i++) {
    st += String.fromCharCode(randomNumber(65,90));
  }
  return st;
}

// a function that encodes strings into hexadecimal format.
// string {string} - the string to be encoded
function encodeHex(string) {
  var hex = "";
  for(var c = 0; c < string.length; c++){
    hex += string.charCodeAt(c).toString(16); //convert char to hex
  }
  return hex;
}

//a function that allows for HTTP requests to any server and REST data.
//onresponse {function} - a function that gets executed with the 'data" argument when the server responds.
//headers {JSON} - data to be sent to the server. 
//cache {boolean} - decides if the content should be cached or not.
function srvHTTP(onresponse, verbose, cache, url, method, data, headers){ 

  var st = Date.now(); //start time for speed testing
  var dp_id = randomString(16); //generating random id for loading canvas
  var dl_id = randomString(16); //generating random id for downloading image
  var res = 765; //image resoultion to match the server's response (res x res)
  var anti_cache;

  if(!cache) {
    anti_cache = randomString(16); //by randomizing the cache parameter, the url will appear new to code.org's request server causing the request to be fresh data.
  } else {
    anti_cache = "none"; //by setting anti_cache to the "none" value the request will remain the same, causing code.org's request server to use the cached response (if any)
  }

  createCanvas(dp_id, res, res); //creating image retrieval canvas.
  hideElement(dp_id); //hiding image retrieval canvas.
  setActiveCanvas(dp_id); //setting image retrieval canvas to the main canvas.
  
  var sd = encodeHex(JSON.stringify( //encoding request data into hexadecimal format for URL-safe data.
      {
        "url": url,
        "method": method,
        "data": data,
        "headers": headers,
        "ac": anti_cache
      }
    ));
    
  image(dl_id, "https://dbhs.dev/corgi/?data=" + sd); //sending image download request
  hideElement(dl_id);
  if(verbose) {console.log("Downloading data...");}
  var loadChecker = setInterval(function(){
    try{
      drawImage(dl_id, 0, 0, res, res); 
      if(getImageData(0, 0, 1, 1).data[0] != 0) {
        clearInterval(loadChecker); //clears the load checker interval when the image has loaded before proceeding
        var id = getImageData(0, 0, res, res); //getting the entirety of image data
        var string = ""; //creating a blank string for data retrieval
        if(verbose) {console.log("Image data fully loaded, reconstructing data.");}
        for(var x = 4; x < res*res; x+=4){ //looping through pixel data
          if(id.data[x-2] == 255 && id.data[x-3] == 0) { //if the current pixel is blue (0,0,255) that means the data has ended and there is no more need to traverse the pixels.
            break; //break out of loop on blue end pixel.
          } else {
            string += String.fromCharCode(id.data[x-2]); //assemble the server response from the image's ASCII values.
          }
        }
        if(verbose) { console.log("Data reconstructed, load finished in "+ (Date.now() - st) + " ms"); }
        onresponse(string);
      }
    }
    catch {
      clearInterval(loadChecker);
      if(verbose) { console.log("Request error."); }
      return "request error.";
    }
    deleteElement(dp_id); //clearing the temp canvas element
    deleteElement(dl_id); //clearing the temp image element
  }, 50);
}

//make a template string to easily include variables and other data in a string.
//string {string} - the string to use with the template. to insert variables use ^^<var index>^^ eg. (^^1^^)
//items {list} - a list of items to use within the template.
function templateString(string, items) {
  
}