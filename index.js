var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(require('connect-assets')());
app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index');
});

app.use('/api', require('./api'));

var MotionSensor = require('./data/motion_sensor');

var ms = new MotionSensor();

ms.initialize(function (err) {
    console.log(err);
});

var count = 0;
var start = +new Date();

ms.on('data', function (data) {
    count++;
    if (count % 5 == 0) {
        io.sockets.emit('data', data);
    }
});

ms.on('inside', function () {
    io.sockets.emit('inside');
});

ms.on('outside', function () {
    io.sockets.emit('outside');
});

http.listen(3000);