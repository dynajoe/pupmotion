var serialPort = require('serialport');
var childProcess = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
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

var STATE = {
   ABOVE: 1,
   BELOW: 2,
};

var LEDS = {
   LEFT: 'led1',
   TOP: 'led2',
   RIGHT: 'led3',
};

var MotionSensor = function () {
   EventEmitter.call(this);
   this.port = null;
   this.threshold = 1000;
   this.buffer = [];
   this.maxBufferSize = 50;
   this.state = STATE.BELOW;
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
         } catch (e) {
            //console.log(e);
            return;
         }

         data.threshold = this.threshold;

         this.emit(data.type, data);

         if (data.type === "data") {
            this.addPoints(data);
         }
      }.bind(this));

      MotionSensor.port = port;

      callback(null);
   }.bind(this));

  return this;
};

MotionSensor.prototype.addPoints = function (points) {
   this.buffer.push(points);

   var aboveThreshold = _.all([points[LEDS.LEFT], points[LEDS.RIGHT]], function (v) {
      return v > this.threshold;
   }.bind(this));

   var oldState = this.state;

   if (aboveThreshold) {
      this.state = STATE.ABOVE;
   } else {
      this.state = STATE.BELOW;
   }

   if (oldState != this.state) {
      this.endEvent();
   }

   if (this.buffer.length >= this.maxBufferSize) {
      this.buffer = this.buffer.slice(-this.maxBufferSize);
   }
};

MotionSensor.prototype.endEvent = function () {
   this.detectEvent();
   this.buffer = [];
};

var leds = [LEDS.LEFT, LEDS.RIGHT];

MotionSensor.prototype.detectEvent = function () {
   var that = this;

   var last = _.findLast(this.buffer, function (v) {
      var aboveThreshold = _.filter(leds, function (k) {
         return v[k] >= that.threshold;
      });

      return aboveThreshold.length != leds.length;
   });

   if (!last) {
      return;
   }

   if (last.led1 > last.led3) {
      this.emit('left');
   } else {
      this.emit('right');
   }
};

MotionSensor.prototype.getMaxValues = function () {
   var leds = [LEDS.LEFT, LEDS.RIGHT];

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