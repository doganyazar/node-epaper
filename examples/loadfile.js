'use strict';

var path = require('path');
var fs = require('fs');
var epaper = require('../index.js');

var gpio = require('../gpio.js');

var filePath = path.join(path.dirname(fs.realpathSync(__filename)), 'samples/dodo.epd');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
}, function(err) {
  if (err) {
    throw new Error(err);
  }

  epaper.uploadImage(filePath, function(err, data) {
    console.log(err, data);
  });
});
