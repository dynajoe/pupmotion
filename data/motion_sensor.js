var serialPort = require('serialport');
var child_process = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');

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
   this.threshold = 10000;
   this.buffer = [];
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
         try { 
            data = JSON.parse(data);
            this.addPoints(data);
            MotionSensor.emit('data', data); 
         } catch(e) { }
      }.bind(this));

      MotionSensor.port = port;

      callback(null);
   });

  return this;
};

Collector.prototype.addPoints = function (points) {
   var aboveThreshold = _.some(_.values(points), function (v) {
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

Collector.prototype.endEvent = function  () {
   this.detectEvent();
   this.buffer.length = 0;
};

Collector.prototype.detectEvent = function () {
   var leds = ["led1", "led2", "led3"];

   var maxes = _.reduce(this.buffer, function (acc, v) {
      _.each(leds, function (k) {
         if (!acc[k] || v[k] > acc[k].value) {
            acc[k] = { ticks: v.ticks, value: v[k] };
         }
      });
      return acc;
   }, {});

   if (maxes.led1.ticks > maxes.led3.ticks) {
      this.emit("left");
   } else {
      this.emit("right");
   }
};

module.exports = MotionSensor;