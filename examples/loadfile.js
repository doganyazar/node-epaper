'use strict';

var epaper = require('../index.js');

epaper.init({
  spiDev: '/dev/spidev1.0',
  clockSpeed: 1e5
});

function testImage() {
    var filePath = './samples/text_1bit.epd';
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

epaper.getVersion();

testImage();
