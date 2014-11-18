var api = require('express')();
var events = [];

api.get('/events', function (req, res) {
   res.send(events);
});

api.post('/enter', function (req, res) {

});

api.post('/exit', function (req, res) {

});

module.exports = api;