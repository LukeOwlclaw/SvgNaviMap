var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
	dns = require('dns'),
	os = require('os'),
	archiver = require('archiver'),
    port = process.argv[2] || 8888,
	port2 = process.argv[3] || 8887;
 
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
dns.lookup(os.hostname(), function (err, add, fam) {
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
		dns.lookup(os.hostname(), function (err, add, fam) {
			response.write(add + ":" +port2);
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

http.createServer(function(request, response) {
	var error = null;
	console.log("request: " + request.method + " " + request.url);
	var uri = url.parse(request.url).pathname;
	
	var output_filepath = path.join(process.cwd(), '/data/out.zip');
	var out = fs.createWriteStream(output_filepath);
	var archive = archiver('zip');
	
	out.on('close', function() {
		if(error){
			console.log('archiver has encoutered an error, but the output file descriptor has closed.');
			return;
		}
		console.log('archiver has been finalized and the output file descriptor has closed.');
		
		fs.readFile(output_filepath, "binary", function(err, file) {
			  if(err) {        
				response.writeHead(500, {"Content-Type": "text/plain"});
				response.write(err + "\n");
				response.end();
				console.log("Internal server error: " + err + "\n");
				return;
			}
			
			name = query.arg[0].substring(0, query.arg[0].length - 3);
			response.writeHead(200, {	"Cache-Control": "no-cache, must-revalidate", 
										"Content-Description": "File Transfer",
										"Content-type": "application/octet-stream",
										"Content-Disposition": "attachment; filename="+ name + "zip",
									});
			response.write(file, "binary");
			response.end();
		});
		
	});

	out.on('error', function(err) {
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(err + "\n");
		response.end();
		console.log("Internal server error: " + err + "\n");
		error=err;
	});
	
	archive.on('error', function(err) {
		response.writeHead(500, {"Content-Type": "text/plain"});
		response.write(err + "\n");
		response.end();
		console.log("Internal server error: " + err + "\n");
		error=err;
	});

	archive.pipe(out);
	
	var query = url.parse(request.url, true).query;

	for( var i in query.arg) {
		
			var file=query.arg[i];
			var filepath = path.join(process.cwd(), "/data/" + file);
			console.log("Requested : " + file + " from " + filepath);
			archive.append(fs.createReadStream(filepath), { name: file });
	}
	archive.finalize(function(err, bytes) {
		if (err) {
			response.writeHead(500, {"Content-Type": "text/plain"});
			response.write(err + "\n");
			response.end();
			console.log("Internal server error: " + err + "\n");
			error=err;
		}
		console.log(bytes + ' total bytes');
	});
}).listen(parseInt(port2, 10));

process.on('uncaughtException', function (err) {
    console.log(err);
}); 