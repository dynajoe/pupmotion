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

ms.on('data', function (data) {
	io.sockets.emit('data', data);
});

http.listen(3000);