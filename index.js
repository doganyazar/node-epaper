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

var spi = SPI.initialize("/dev/spidev1.0");
spi.dataMode(SPI.mode.CPHA | SPI.mode.CPOL);
spi.clockSpeed(1e5); //200 kHz

var MAX_CHUNK_SIZE = 0xFA;
function sendBuf(buf, maxChunkSize) {
    var chunks = u.chunk(buf, maxChunkSize);

    async.eachSeries(chunks, function(chunk, callback) {
        var INS = 0x20;
        var P1 = 0x01;
        var P2 = 0x00;
        var Lc = chunk.length;
        chunk.unshift.apply(chunk, [INS, P1, P2, Lc]);

        var chunkToWrite = new Buffer(chunk);
        console.log("Chunk Size", chunkToWrite.length, 'Chunk:', chunkToWrite);

        spi.write(chunkToWrite, function(err) {
            console.log("WRITE CB", arguments);
            var rxbuf = new Buffer(2);
            // spi.read(2, function(err, rxbuf) {
            //     console.log("READ", rxbuf);
            //     if (rxbuf[0] === 0x90 && rxbuf[1] === 0x00) {
            //         return callback();
            //     }
            //     return callback(new Error(rxbuf));
            // });
            callback(err);
        });
    }, function(err){
        // if any of the file processing produced an error, err would equal that error
        if( err ) {
          console.log('Error Result', err);
        } else {
          console.log('All fine');
          spi.read(2, function(err, rxbuf) {
              console.log("RESULT", rxbuf);
          });
        }
    });
}

function testImage() {
    var filePath = "./examples/samples/text_1bit.epd";
    sendEpdFile(filePath);
}

function sendEpdFile(filePath) {
    var imageStream = fs.createReadStream(filePath);

    imageStream.on('data', function(chunk) {
      console.log('got %d bytes of data', chunk.length);

      sendBuf(chunk, 120);
    });

    imageStream.on('end', function() {
         console.log("Done baby");
    });
}

function displayUpdate(cb) {
    cb = cb || function() {};
    var command = new Buffer([0x24, 0x01, 0x00]);
    runCommand(command, cb);
}

function resetPointer(cb) {
    cb = cb || function() {};
    var command = new Buffer([0x20, 0x0D, 0x00]);
    runCommand(command, cb);
}

function runCommand(command, cb) {
    spi.write(command, function (err) {
        if (err) {
            console.error('Display update ERROR', err);
            return cb(err);
        }

        spi.read(2, function(err, data) {
            console.log("DUMMY READ", data);
            console.log("DUMMY READ", data.toString());

            return cb(err, data);
        });
    });
}

//TODO use runCommand!
function getVersion() {
    var command = new Buffer([0x30, 0x01, 0x01, 0x00]);
    spi.write(command, function (e,d) {
        if (e) {
            return console.log('ERROR', e);
        }
        spi.read(32, function(e, d) {
            if (e) {
                return console.log('ERROR', e);
            }

            console.log("READ", d);
            console.log("READ Str", d.toString());
        });
    });
}
