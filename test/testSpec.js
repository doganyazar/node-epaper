'use strict'

var test = require('tape');
var fs = require('fs');
var async = require('async');

//TODO relative paths
var sample4bitPath = './examples/samples/PDI74_2_4bit.png'
var sampleEpdPath = './examples/samples/PDI74_2_1bit.epd';

var epaper = require('../index.js');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
});


//TODO convert this to stream
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

test('Type4_4bit_to_epd', function (t) {
  t.plan(1);

  async.parallel([
    function(callback) {
      readFile(sample4bitPath, function(err, buf) {
        callback(null, buf);
      });
    },
    function(callback) {
      readFile(sampleEpdPath, function(err, buf) {
        console.log('sample epd', buf.length);
        callback(null, buf);
      });
    }
], function (err, result) {
  var sample4bit = result[0];
  var sampleEpd = result[1];
  console.log('sample4bit', sample4bit.length);
  console.log('sampleEpd', sampleEpd.length);
  var converted = epaper._convertTo1bit_PixelFormatType4(sample4bit);
  console.log('converted', converted.length);

  t.equal(converted, sampleEpd);
});



});
