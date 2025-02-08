function randomString(length) {
    var st = "";
    for(var i = 0; i < length; i++) {
      st += String.fromCharCode(randomNumber(65,90));
    }
    return st;
  }

//a function that allows for HTTP requests to any server and REST data.
//onresponse {function} - a function that gets executed with the 'data" argument when the server responds.
//data {JSON} - data to be sent to the server. 
//  data.method {string} - the REST method to connect to the server with.
//  data.ua {string} - the user agent sent to the server.
//cache {boolean} - decides if the content should be cached or not.
function httpget(onresponse, data, cache){ 
    //a function that allows for HTTP requests to any server.
    //server side converts whatever string is needed into an image containing ASCII numbers
    //client side draws the image out on a canvas and gets the pixel values, then converts them back into a string.
    var st = Date.now();
    var dp_id = randomString(16); //identifier for data reading canvas
    var dl_id = randomString(16); //identifier for data retrieval canvas
    var anti_cache;
    if(cache) {
      anti_cache = randomString(16);
    } else {
      anti_cache = "none";
    }
    //creating hidden data reading canvas
    createCanvas(dp_id, 100, 100);
    hideElement(dp_id);
    setActiveCanvas(dp_id);
    //creating hidden data retrieval image
    image(dl_id, "https://00d6-72-193-9-27.ngrok-free.app/?data=" + data + "&ac=" + anti_cache);
    hideElement(dl_id);
    //checking if the image has loaded.
    var loadChecker = setInterval(function(){
    drawImage(dl_id, 0, 0, 100, 100); //draws the image on the canvas
    if(getImageData(0, 0, 1, 1).data[0] != 0) { //runs when image data has loaded.
    clearInterval(loadChecker); //clears the load checker interval when the image has loaded before proceeding
    var id = getImageData(0, 0, 100, 100); //getting the entirety of image data
    var string = ""; //creating a blank string for data retrieval
  
    for(var x = 0; x < 100*100; x+=4){ //looping through pixel data
      if(id.data[x] != 0) { //checking if data is valid
        string += String.fromCharCode(id.data[x]); //assemble the server response from the image's ASCII values.
      }
    }
    console.log("load finished in "+ (Date.now() - st) + " ms");
    deleteElement(dp_id); //clearing the temp canvas element
    deleteElement(dl_id); //clearing the temp image element
    onresponse(string); //running the onresponse function with server response
    }
    }, 50);
  }