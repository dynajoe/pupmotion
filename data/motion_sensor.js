var serialPort = require('serialport');
var childProcess = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var usbDeviceName = "cu.usbmodem1411";

var getPortConnect = function (callback) {
   if (os.platform() === 'win32') {
      return callback(null, 'COM5');
   }

   childProcess.exec('ls /dev | grep ' + usbDeviceName, function (err, stdout) {
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
   this.threshold = 3000;
   this.buffer = [];
};

util.inherits(MotionSensor, EventEmitter)

MotionSensor.prototype.send = function (command) {
   if (this.port) {
      this.port.write(command.trim() + '\n');
   }
};

MotionSensor.prototype.initialize = function (callback) {
   console.log('initialize motion sensor');

   var MotionSensor = this;

   getPortConnect(function (err, discoveredPort) {
      if (err) {
         console.log(err);
         return callback(err);
      }

      var port = new serialPort.SerialPort(discoveredPort, {
         baudrate: 9600,
         parser: serialPort.parsers.readline('\n')
      });

      port.on('data', function (data) {
         try {
            data = JSON.parse(data);
            this.emit('data', data);
            this.addPoints(data);
         } catch (e) {
            //console.log(e);
         }
      }.bind(this));

      MotionSensor.port = port;

      callback(null);
   }.bind(this));

  return this;
};

MotionSensor.prototype.addPoints = function (points) {

   var aboveThreshold = _.some([points.led1, points.led2, points.led3], function (v) {
      return v > this.threshold;
   }.bind(this));

   if (!aboveThreshold) {
      if (this.buffer.length > 0) {
         this.endEvent();
      }
   } else {
      this.buffer.push(points);
   }
};

MotionSensor.prototype.endEvent = function  () {
   this.detectEvent();
   this.buffer.length = 0;
};

MotionSensor.prototype.detectEvent = function () {
   var maxes = this.getMaxValues();

   if (maxes.led1.ticks > maxes.led3.ticks) {
      this.emit("inside");
   } else {
      this.emit("outside");
   }
};

MotionSensor.prototype.getMaxValues = function () {
   var leds = ["led1", "led2", "led3"];

   var maxes = _.reduce(this.buffer, function (acc, v) {
      _.each(leds, function (k) {
         if (!acc[k] || v[k] > acc[k].value) {
            acc[k] = { ticks: v.ticks, value: v[k] };
         }
      });
      return acc;
   }, {});

   return maxes;
};

module.exports = MotionSensor;