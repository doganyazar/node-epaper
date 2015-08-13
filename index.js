'use strict';

var SPI = require('pi-spi');
var async = require('async');
var u = require('lodash');
var fs = require('fs');

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
    this._runCommand(command, cb);
}

Epaper.prototype._runCommand = function _runCommand(command, cb) {
  var self = this;
  self.spi.write(command, function (err) {
    if (err) {
      console.error('Display update ERROR', err);
      return cb(err);
    }

    self.spi.read(2, function(err, data) {
      console.log("DUMMY READ", data);
      console.log("DUMMY READ", data.toString());

      return cb(err, data);
    });
  });
}

//TODO use runCommand and return cb
Epaper.prototype.getVersion = function getVersion() {
  var self = this;
  var command = new Buffer([0x30, 0x01, 0x01, 0x00]);
  self.spi.write(command, function (e,d) {
    if (e) {
      return console.log('ERROR', e);
    }
    self.spi.read(32, function(e, d) {
      if (e) {
        return console.log('ERROR', e);
      }

      console.log("READ", d);
      console.log("READ Str", d.toString());
    });
  });
};


Epaper.prototype.init = function init(options) {
  var spiDev = options.spiDev || '/dev/spidev1.0';
  var clockSpeed = options.clockSpeed || 1e5; //100 khz

  this.spi = SPI.initialize(spiDev);
  this.spi.dataMode(SPI.mode.CPHA | SPI.mode.CPOL);
  this.spi.clockSpeed(clockSpeed);
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

Epaper.prototype.displayUpdate = function displayUpdate(cb) {
    cb = cb || function() {};
    var command = new Buffer([0x24, 0x01, 0x00]);
    this._runCommand(command, cb);
};


module.exports = new Epaper();
