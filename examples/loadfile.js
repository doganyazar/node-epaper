'use strict';

var path = require('path');
var fs = require('fs');
var epaper = require('../index.js');

var filePath = path.join(path.dirname(fs.realpathSync(__filename)), 'samples/dodo.epd')

function testImage() {
    epaper.sendEpdFile(filePath, function(err) {
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
}

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
}, function(err) {
  if (err) {
    throw new Error(err);
  }

  testImage();
});
