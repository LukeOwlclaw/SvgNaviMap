
// test for "adding file with STORE method"


var zipstream = require('../zipstream');
var crypto = require('crypto');
var zip = zipstream.createZip({ level: 1 });

/*
var fs = require('fs');
var out = fs.createWriteStream('out.zip');
zip.pipe(out);
*/

// create a buffer and fill it

var buf = new Buffer(20000);

for (var i=0; i<20000; i++) {
  buf.writeUInt8(i&255, i);
}

// create a file using the buffer

zip.addFile(buf, { name: 'buffer.out', date: new Date('April 13, 2011 CET'), store: true }, function() {
  zip.finalize();
});


// compute digest of zip output and compare

var hash = crypto.createHash('sha1');
zip.on('data', function(data) {
  hash.update(data);
});

zip.on('end', function() {
  var digest = hash.digest('hex');
  var expected = 'a777c51ca558e9a2ff36f1f9b7fc70b95560df28';

  console.log('digest: %s expected: %s', digest, expected);
  if (expected === digest) {
    console.log('ok!');
  } else {
    console.log('ERROR! mismatch between expected and computed digest');
  }
});
