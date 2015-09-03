'use strict';

var SPI = require('pi-spi');
var async = require('async');
var u = require('lodash');
var fs = require('fs');
var gpio = require('./gpio.js');

// SPI Settings
// Bit rate – up to 3 MHz
// Polarity – CPOL = 1; clock transition high-to-low on the leading edge and low-to-high on the
// trailing edge
// Phase – CPHA = 1; setup on the leading edge and sample on the trailing edge
// Bit order – MSB first
// Chip select polarity – active low


var ResultCodes = {
    EP_SW_NORMAL_PROCESSING: 0x9000, //command successfully executed
    EP_SW_WRONG_LENGTH: 0x6700, //incorrect length (invalid Lc value or command too short or too long)
    EP_SW_INVALID_LE: 0x6C00, //invalid Le field
    EP_SW_WRONG_PARAMETERS_P1P2: 0x6A00, //invalid P1 or P2 field
    EP_SW_INSTRUCTION_NOT_SUPPORTED: 0x6D00, //command not supported
};


function Epaper () {

}

function resetPointer(cb) {
    cb = cb || function() {};
    var command = new Buffer([0x20, 0x0D, 0x00]);
    this._runCommand(command, 2, cb);
}

Epaper.prototype._runCommand = function _runCommand(command, readBytes, cb) {
  var self = this;
  self.spi.write(command, function (err) {
    if (err) {
      console.error('Display update ERROR', err);
      return cb(err);
    }

    self.spi.read(readBytes, function(err, data) {
      console.log("DUMMY READ", data);
      console.log("DUMMY READ", data.toString());

      return cb(err, data);
    });
  });
}

function parseInfo(infoBuf) {
  var info = {};

  info.buf = infoBuf;
  info.str = infoBuf.toString();

  if (info.str) {
    var splits = info.str.split('-');
    if (splits[0] === 'MpicoSys TC') {
      info.size = splits[1];
      info.version = splits[2];
    }
  }

  return info;
}

Epaper.prototype.displayUpdate = function displayUpdate(cb) {
    cb = cb || function() {};
    var command = new Buffer([0x24, 0x01, 0x00]);
    this._runCommand(command, 2, cb);
};

Epaper.prototype.getDeviceInfo = function getDeviceInfo(cb) {
  var self = this;
  var command = new Buffer([0x30, 0x01, 0x01, 0x00]);

  this._runCommand(command, 32, function(err, data) {
    if (err) {
      return cb(err);
    }
    return cb(null, parseInfo(data));
  });
};

Epaper.prototype.init = function init(options, cb) {
  var spiDev = options.spiDev || '/dev/spidev1.0';
  var clockSpeed = options.clockSpeed || 1e5; //100 khz

  this.spi = SPI.initialize(spiDev);
  this.spi.dataMode(SPI.mode.CPHA | SPI.mode.CPOL);
  this.spi.clockSpeed(clockSpeed);

  return gpio.init(cb);
};

//pin=1 -> not busy
Epaper.prototype.isBusy = function isBusy(cb) {
  return gpio.get(gpio.pins.P8_10, function(err, val) {
    return cb(val ? false: true);
  });
};

Epaper.prototype.enable = function enable(cb) {
  return gpio.set(gpio.pins.P9_12, 0, cb);
};

Epaper.prototype.disable = function disable(cb) {
  return gpio.set(gpio.pins.P9_12, 1, cb);
};

var MAX_CHUNK_SIZE = 0xFA;
Epaper.prototype._sendBuf = function _sendBuf(buf, maxChunkSize, cb) {
  var self = this;
  var chunks = u.chunk(buf, maxChunkSize);

  async.eachSeries(chunks, function(chunk, callback) {
    var INS = 0x20;
    var P1 = 0x01;
    var P2 = 0x00;
    var Lc = chunk.length;
    chunk.unshift.apply(chunk, [INS, P1, P2, Lc]);

    var chunkToWrite = new Buffer(chunk);
    console.log("Chunk Size", chunkToWrite.length, 'Chunk:', chunkToWrite);

    self.spi.write(chunkToWrite, function(err) {
      console.log("WRITE CB", arguments);
      var rxbuf = new Buffer(2);
      callback(err);
    });
  }, function(err){
    // if any of the file processing produced an error, err would equal that error
    if( err ) {
      console.log('Error Result', err);
      return cb(err);
    } else {
      console.log('All fine');
      self.spi.read(2, function(err, rxbuf) {
        console.log("RESULT", rxbuf);
        return cb();
      });
    }
  });
};

Epaper.prototype.sendEpdFile = function sendEpdFile(filePath, cb) {
  var self = this;
  var imageStream = fs.createReadStream(filePath);
  var chunkSize = 120;

  imageStream.on('data', function(chunk) {
    console.log('got %d bytes of data', chunk.length);

    self._sendBuf(chunk, chunkSize, cb);
  });

  imageStream.on('end', function() {
    console.log('Stream End');
  });
};

//Convert from RGBA to 1 byte
Epaper.prototype.greyscaleImageTo1Bit = function greyscaleImageTo1Bit(image, luminanceFun){
  function luminance(r, g, b) {
    return ((r * 0.3) + (g * 0.59) + (b * 0.11)) > 128 ? 1 : 0;
  }

  var rawImage = image.bitmap.data;
  luminanceFun = luminanceFun || luminance;

  if (rawImage.length % 32 !== 0) {
    throw Error('Not supported raio');
  }

  var buf = new Buffer(rawImage.length/4);

  for (var i = 0, bit = 0; i < rawImage.length; i += 4){
     var r = rawImage[i];
     var g = rawImage[i+1];
     var b = rawImage[i+2];
     var a = rawImage[i+3];

     buf[i/4] = luminanceFun(r, g, b);
  }

  return buf;
}


var headerTCP74230 = new Buffer(
  [0x3A, 0x01, 0xE0, 0x03, 0x20, 0x01, 0x04, 0x00,
  0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

//From TCS Developers Guide
//This format is used in TC-P74-230.
Epaper.prototype._convertTo1bit_PixelFormatType4 =
function _convertTo1bit_PixelFormatType4(picData) {
  var newPicData = new Buffer(headerTCP74230.length + picData.length / 8);

  headerTCP74230.copy(newPicData);

  var row = 30;
  var s = 1;

  for (var i = 0; i < picData.length; i += 16)
  {
    newPicData[headerTCP74230.length + row-s] =
      ((picData[i + 6 ] << 7) & 0x80) |
      ((picData[i + 14] << 6) & 0x40) |
      ((picData[i + 4 ] << 5) & 0x20) |
      ((picData[i + 12] << 4) & 0x10) |
      ((picData[i + 2 ] << 3) & 0x08) |
      ((picData[i + 10] << 2) & 0x04) |
      ((picData[i + 0 ] << 1) & 0x02) |
      ((picData[i + 8 ] << 0) & 0x01);


    newPicData[headerTCP74230.length + row+30-s] =
      ((picData[i + 1 ] << 7) & 0x80) |
      ((picData[i + 9 ] << 6) & 0x40) |
      ((picData[i + 3 ] << 5) & 0x20) |
      ((picData[i + 11] << 4) & 0x10) |
      ((picData[i + 5 ] << 3) & 0x08) |
      ((picData[i + 13] << 2) & 0x04) |
      ((picData[i + 7 ] << 1) & 0x02) |
      ((picData[i + 15] << 0) & 0x01);

    s++;

    if(s == 31){
      s = 1;
      row += 60;
    }
  }

  return newPicData;
};


module.exports = new Epaper();
