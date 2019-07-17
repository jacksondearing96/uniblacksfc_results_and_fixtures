var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);

app.listen(8081);

module.exports = app;