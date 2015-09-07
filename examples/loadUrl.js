'use strict';

var epaper = require('../index.js');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
}, function(err) {
  if (err) {
    throw new Error(err);
  }

  epaper.uploadFromUrl('http://www.york.ac.uk/teaching/cws/wws/webpage1.html', function(err, data) {
    console.log(err, data);
  });
});
