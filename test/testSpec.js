'use strict'

var test = require('tape');
var fs = require('fs');
// var async = require('async');
var Jimp = require("jimp");

var sample1BitPngPath = './examples/samples/PDI74_2_1bit.png';
var sampleEpdPath = './examples/samples/PDI74_2_1bit.epd';

var epaper = require('../index.js');



test('init', function (t) {
  epaper.init({
    spiDev: '/dev/spidev1.0',
    clockSpeed: 1e5
  }, function(err, data) {
    t.error(err);
    if (err) {
      console.log('Init err', err);
      process.exit(1);
    }

    var expected = 'MpicoSys TC-';

    t.equal(data.str.slice(0, expected.length), expected);
    t.end();
  });
});
