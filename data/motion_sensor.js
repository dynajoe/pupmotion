var serialPort = require('serialport');
var child_process = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var getPortConnect = function (callback) {
   if (os.platform() === 'win32') {
      return callback(null, 'COM5');
   }

   child_process.exec('ls /dev | grep cu.usbserial', function (err, stdout) {
      var ports = stdout.trim().split('\n');

      if (ports.length == 0 || !ports[0]) {
         return callback('Unable to connect to xbee.');
      }

      callback(null, '/dev/' + ports[0]);
   });
};

var MotionSensor = function () {
   EventEmitter.call(this);
   this.port = null;
};

util.inherits(MotionSensor, EventEmitter)

MotionSensor.prototype.send = function (command) {
   if (this.port) {
      this.port.write(command.trim() + '\n');    
   }
};

MotionSensor.prototype.initialize = function (callback) {
   var MotionSensor = this;

   getPortConnect(function (err, discoveredPort) {
      if (err) {
         return callback(err);
      } 

      var port = new serialPort.SerialPort(discoveredPort, {
         baudrate: 9600,
         parser: serialPort.parsers.readline('\n') 
      }); 

      port.on('data', function (data) {
         try { MotionSensor.emit('data', JSON.parse(data)); } catch(e) { }
      });

      MotionSensor.port = port;

      callback(null);
   });

  return this;
};

module.exports = MotionSensor;