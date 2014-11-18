var express = require('express');
var app = express();
app.use(require('connect-assets')());
app.set('view engine', 'jade');

app.get('/', function (req, res) {
    res.render('index');
});

app.use('/api', require('./api'));

var MotionSensor = require('./data/motion_sensor');
var ms = new MotionSensor();
ms.on('data', function (data) {
	console.log(data);
});

app.listen(3000);