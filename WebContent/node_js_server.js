var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;
 
http.createServer(function(request, response) {
 
  console.log("request: " + request.url);
  var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri);
  
    path.exists(filename, function(exists) {
		
		if(!exists) {
			response.writeHead(404, {"Content-Type": "text/plain"});
			response.write("404 Not Found\n");
			response.end();
			return;
		}
	 
		if (fs.statSync(filename).isDirectory()) {
			filename += '/index.html';
		}
	 
		fs.readFile(filename, "binary", function(err, file) {
		  if(err) {        
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
			return;
		}
	 
		//throttleUpload(request, 5, 500)
		
		response.writeHead(200, {"Cache-Control": "no-cache, must-revalidate"});
		
		//response.writeHead(200, {"Cache-Control": "public, max-age=60, s-maxage=60"});
		
		
		response.write(file, "binary");
		
		response.end();
		/*setTimeout(function() {
			response.end();
			}, 2000);*/
		});
	});
}).listen(parseInt(port, 10));
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

var toggle = true;
function throttleUpload(req, msBusy, msWait) {
  if(req.complete) 
  {
    toggle = true;
    return;
  }  
  
  if (toggle)
  {
    console.log("pause");
    req.pause();
    toggle = !toggle;
    setTimeout(function() {
      throttleUpload(req, msBusy, msWait);
     }, msWait);
   }
   else
   {
    console.log("resume");
    req.resume();
    toggle = !toggle;
    setTimeout(function() {
      throttleUpload(req, msBusy, msWait);
     }, msBusy);

   }
}