'use strict'

var test = require('tape');
var fs = require('fs');
// var async = require('async');
var Jimp = require("jimp");

var sample1BitPngPath = './examples/samples/PDI74_2_1bit.png';
var sampleEpdPath = './examples/samples/PDI74_2_1bit.epd';

var epaper = require('../index.js');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
});

//
// test('greyscaleImageTo1Bit', function (t) {
//   t.plan(1);
//   var image = {
//     bitmap: {
//       data = new Buffer([0x]);
//     }
//   }
//
//   epaper.greyscaleImageTo1Bit(image);
// });

// var lenna = new Jimp("/Users/doganyazar/playground/nodeDene/1.jpg", function (err, image) {
//     this.resize(480, 800) // resize
//         .write("lenna-small.png") // save
//         .quality(60) // set JPEG quality
//         .write("lenna-small.jpg") // save as JPEG
//         .greyscale() // set greyscale
//         .write("lena-small-bw.png")
// });

var newImagePath = './examples/samples/heading.png'


test('Epd conversion', function (t) {
  var sample1BitPng = new Jimp(newImagePath, function (err, image) {
    this.resize(480, 800) // resize
    .greyscale();

      console.log('Data len', image.bitmap.data.length);
      console.log('Data width', image.bitmap.width);
      console.log('Data height', image.bitmap.height);

      var oneBitBuf = epaper.greyscaleImageTo1Bit(image);
      console.log('oneBitBuf', oneBitBuf.length);

      var out = epaper._convertTo1bit_PixelFormatType4(oneBitBuf);
      console.log('out', out.length);

      fs.writeFile('dodo.epd', out, function(err) {
        if (err) {
          throw err;
        }

        epaper.sendEpdFile('dodo.epd', function(err) {
          if (err) {
            return console.log('Error loading the file!');
          }

          epaper.displayUpdate(function(err) {
            if (err) {
              return console.log('Error refreshing display');
            }
            console.log('Image update successful!');
          });
        });
      });
  });
});


function readFile(path, cb) {
  fs.open(path, 'r', function(status, fd) {
    if (status) {
      console.log(status.message);
      return cb(status);
    }

    //TODO fix this max size
    var buffer = new Buffer(50000);
    fs.read(fd, buffer, 0, buffer.length, 0, function(err, size) {
      buffer = buffer.slice(0, size);
      cb(null, buffer);
    });
  });
}

//
// function imageTo1Bit(image) {
//   var rawImage = image.bitmap.data;
//   var buf = new Buffer(rawImage.length/4);
//
//   for (var i = 0; i < rawImage.length ;i += 4){
//     buf[i/4] = rawImage[i];
//   }
//
//   return buf;
// }

//
// test('Type4_4bit_to_epd', function (t) {
//   t.plan(1);
//
//   async.parallel([
//     function(callback) {
//       readFile(sample4bitPath, function(err, buf) {
//         callback(null, buf);
//       });
//     },
//     function(callback) {
//       readFile(sampleEpdPath, function(err, buf) {
//         console.log('sample epd', buf.length);
//         callback(null, buf);
//       });
//     }
//   ], function (err, result) {
//     var sample4bit = result[0];
//     var sampleEpd = result[1];
//     console.log('sample4bit', sample4bit.length);
//     console.log('sampleEpd', sampleEpd.length);
//     var converted = epaper._convertTo1bit_PixelFormatType4(sample4bit);
//     console.log('converted', converted.length);
//
//     t.equal(converted, sampleEpd);
//   });
// });
