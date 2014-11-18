var express = require('express');
var app = express();
app.use(require('connect-assets')());
app.set('view engine', 'jade');

app.get('/', function (req, res) {
    res.render('index');
});

app.use('/api', require('./api'));

app.listen(3000);