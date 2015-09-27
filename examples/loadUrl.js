'use strict';

var epaper = require('../index.js');

var url = process.argv[2] || 'www.facebook.com'

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
}, function(err) {
  if (err) {
    throw new Error(err);
  }

  epaper.uploadFromUrl(url, function(err, data) {
    console.log(err, data);
  });
});
