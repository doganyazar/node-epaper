'use strict';

var path = require('path');
var util = require('util');
var child_process = require('child_process');
var fs = require('fs');
var exec = child_process.exec;
var assert = require('assert');

var pins = require('./pins.js');

var gpioInitPath = path.join(path.dirname(fs.realpathSync(__filename)), 'gpio_init.sh')

function getPinPath(pin) {
  return util.format('/sys/class/gpio/gpio%d/value', pin.id);
}

function Gpio() {
  this.pins = pins;
}

Gpio.prototype.init = function init(options, cb) {
  var self = this;
  assert(options.busyPin);
  assert(options.enablePin)
  console.log(gpioInitPath);
  child_process.execFile(gpioInitPath, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (error) {
      return cb(error);
    }
    //config-pin P9.12 out  #EN
    //config-pin P8.10 in   #BUSY

    self.set(options.busyPin, 'in', function(err) {
      if (err) {
        return cb(err);
      }
      self.set(options.enablePin, 'out', function(err) {
        return cb(err);
      });
    });
  });
}

Gpio.prototype.get = function get(pin, cb) {
  fs.readFile(getPinPath(pin), function (err, data) {
    if (err) throw err;
    return cb(null, parseInt(data));
  });
}

function genCommand(pin, value) {
  return util.format('config-pin %s %s', pin.name, value);
}

Gpio.prototype.execCommand = function execCommand(command, cb) {
  exec(command, function (error, stdout, stderr) {
    if (stderr) {
      console.log('stderr: ' + stderr);
    }

    cb(error);
  });
}

Gpio.prototype.set = function set(pin, value, cb) {
  var strValue = 'low';
  if (value === 'in' || value === 'out') {
    strValue = value;
  } else if (value && value !== '0') {
    strValue = 'hi';
  }
  var command = genCommand(pin, strValue);
  this.execCommand(command, cb);
}

module.exports = new Gpio();
