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

ms.on('data', function (data) {
    count++;

    if (count % 3 == 0) {
        io.sockets.emit('data', data);
    }
});

ms.on('bias', function (bias) {
    io.sockets.emit('bias', bias);
});

ms.on('left', function () {
    io.sockets.emit('left');
});

ms.on('right', function () {
    io.sockets.emit('right');
});

http.listen(3000);