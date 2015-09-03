'use strict';

var path = require('path');
var util = require('util');
var child_process = require('child_process');
var fs = require('fs');
var exec = child_process.exec;

var gpioInitPath = path.join(path.dirname(fs.realpathSync(__filename)), 'gpio_init.sh')

function getPinPath(pin) {
  return util.format('/sys/class/gpio/gpio%d/value', pin.id);
}

var pins = {
  P8_10: {name: 'P8.10', id: 68},
  P9_12: {name:'P9.12', id: 60}
};

function Gpio() {
  this.pins = pins;
}

Gpio.prototype.init = function init(cb) {
  console.log(gpioInitPath);
  child_process.execFile(gpioInitPath, function(error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(error);
  });
}

Gpio.prototype.get = function get(pin, cb) {
  fs.readFile(getPinPath(pin), function (err, data) {
    if (err) throw err;
    return cb(null, parseInt(data));
  });
}

Gpio.prototype.set = function set(pin, value, cb) {
  var strValue = 'low';
  if (value && value !== '0') {
    strValue = 'hi';
  }
  var command = util.format('config-pin %s %s', pin.name, strValue);
  exec(command, function (error, stdout, stderr) {
    if (stderr) {
      console.log('stderr: ' + stderr);
    }
    
    cb(error);
  });
}

module.exports = new Gpio();
