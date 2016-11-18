var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express(); 

app.use(express.static(path.resolve(__dirname, 'client'))); //send static files to client
app.use(bodyParser.json());

exports.app = app;

/////[][][][][][][][][][][][][][][][][] run server [][][][][][][][][][][][][][][][]
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server running");
});