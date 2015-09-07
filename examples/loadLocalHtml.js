'use strict';

var epaper = require('../index.js');

var path = require('path');
var fs = require('fs');
var filePath = path.join(path.dirname(fs.realpathSync(__filename)), 'samples/dodo-html1.html');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
}, function(err) {
  if (err) {
    throw new Error(err);
  }

  epaper.uploadFromUrl(filePath, function(err, data) {
    console.log(err, data);
  });
});
