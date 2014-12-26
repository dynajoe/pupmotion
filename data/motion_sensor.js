var serialPort = require('serialport');
var childProcess = require('child_process');
var os = require('os');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
<<<<<<< HEAD
var usbDeviceName = "cu.usbmodem1421";
=======
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401

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
<<<<<<< HEAD
   this.threshold = 3000;
=======
   this.threshold = 10000;
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
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
         baudrate: 57600,
         parser: serialPort.parsers.readline('\n') 
      }); 

      port.on('data', function (data) {
         try { 
            data = JSON.parse(data);
<<<<<<< HEAD
            this.emit('data', data); 
            this.addPoints(data);
         } catch(e) { 
            //console.log(e);
         }
=======
            this.addPoints(data);
            MotionSensor.emit('data', data); 
         } catch(e) { }
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
      }.bind(this));

      MotionSensor.port = port;

      callback(null);
   }.bind(this));

  return this;
};

<<<<<<< HEAD
MotionSensor.prototype.addPoints = function (points) {

   var aboveThreshold = _.some([points.led1, points.led2, points.led3], function (v) {
=======
Collector.prototype.addPoints = function (points) {
   var aboveThreshold = _.some(_.values(points), function (v) {
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
      return v > this.threshold;
   }.bind(this));

   if (!aboveThreshold) {
      if (this.buffer.length > 0) {
         this.endEvent();
      }
   } else {
      this.buffer.push(points);
   }
<<<<<<< HEAD
   
};

MotionSensor.prototype.endEvent = function  () {
=======
};

Collector.prototype.endEvent = function  () {
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
   this.detectEvent();
   this.buffer.length = 0;
};

<<<<<<< HEAD
MotionSensor.prototype.detectEvent = function () {
   var maxes = this.getMaxValues();

   if (maxes.led1.ticks > maxes.led3.ticks) {
      this.emit("inside");
   } else {
      this.emit("outside");
   }
};

MotionSensor.prototype.getMaxValues = function () {
=======
Collector.prototype.detectEvent = function () {
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
   var leds = ["led1", "led2", "led3"];

   var maxes = _.reduce(this.buffer, function (acc, v) {
      _.each(leds, function (k) {
         if (!acc[k] || v[k] > acc[k].value) {
            acc[k] = { ticks: v.ticks, value: v[k] };
         }
      });
      return acc;
   }, {});

<<<<<<< HEAD
   return maxes;
=======
   if (maxes.led1.ticks > maxes.led3.ticks) {
      this.emit("left");
   } else {
      this.emit("right");
   }
>>>>>>> 995cf9be05586dfef78a7905bc0619de7c996401
};

module.exports = MotionSensor;