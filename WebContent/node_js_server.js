var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;
 
http.createServer(function(request, response) {
 
  console.log("request: " + request.method + " " + request.url);
  var uri = url.parse(request.url).pathname, filename = path.join(process.cwd(), uri), methode = request.method;
    
	if(methode=="GET")
	{
		GET(filename,response);
	}
	else 
	{ 
		if (methode=="PUT") {
			PUT(filename,response,request);
		}
		else {
			console.log("Unsupported Request: " + request.method + " " + request.url);
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write("Unsupported Request Methode\n");
			response.end();
			return;
		}
	}
	
}).listen(parseInt(port, 10),'localhost');
 
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  console.log('addr: '+add);
})
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

function GET(filename,response) {
	var s = "ip-address";
	if(filename.indexOf(s) !== -1)
	{
		response.writeHead(200, {"Cache-Control": "no-cache, must-revalidate"});
		require('dns').lookup(require('os').hostname(), function (err, add, fam) {
			response.write(add);
			response.end();
			return;
		})
	}
	else
	{
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
				console.log("Internal server error: " + err + "\n");
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
	}
}

function PUT(filename,response,request) {
	var body = "";
	request.on('data', function (chunk) {
		body += chunk;
	});

	request.on('end', function () {
		fs.writeFile(filename,body, function(err, file) {
			if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				console.log("Internal server error: " + err + "\n");
				return;
			}
			response.writeHead(200);
			response.write("Saved");
			response.end();
		});
	});
}