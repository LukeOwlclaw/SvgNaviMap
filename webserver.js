var fs = require('fs');
var path = require('path');
var zipstream = require('zipstream');
var async = require('async');
var QRCode = require('qrcode-npm');
var express = require('express');
var dns = require('dns');
var os = require('os');
var app = express();

app.use(express.logger());

WEBCONTENT_DIR = 'WebContent'
PORT = 8888

// static files
app.use(express.static(path.join(__dirname, WEBCONTENT_DIR)));

function readAppPackage(cb) {
	fs.readFile('android_package.json', function (err, data) {
		if (err)
			return cb(err);

		cb(err, JSON.parse(data));
	});
}

function getServerIP(cb) {
	dns.lookup(os.hostname(), cb);
}

app.get('/appupdate/version', function (req, res) {
	readAppPackage(function (err, data) {
		if (err) {
			console.error(err);
			return res.send(500, err);
		}

		res.send(data.version);
	});
});

app.get('/appupdate/get.zip', function (req, res) {
	readAppPackage(function (err, data) {
		if (err) {
			return res.send(500, err);
		}

		var zip = zipstream.createZip({level: 1});

		res.header('Content-Type', 'application/zip');
		zip.pipe(res);

		async.eachSeries(data.files, function (filename, cb) {
			zip.addFile(fs.createReadStream(path.join(WEBCONTENT_DIR, filename)), {name: filename}, cb);
		}, function () {
			zip.finalize(function (written) {
				console.log("sent "+written+" bytes zipped app package");
			});
		})
	});
});

app.get('/', function (req, res) {
	getServerIP(function (err, ip) {
		if (err) {
			console.error(err);
			return res.send(500, err);
		}

		var url = 'app,http://'+ip+':'+PORT+'/appupdate/get.zip'

		var qr = QRCode.qrcode(4, 'L');
		qr.addData(url);
		qr.make();

		res.send('App JS/HTML update: '+qr.createImgTag());
	});
});

console.log('serving at 0.0.0.0:'+PORT);
app.listen(PORT, '0.0.0.0');