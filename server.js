var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express(); 

app.use(express.static(path.resolve(__dirname, 'client'))); //send static files to client
app.use(bodyParser.json());

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'us-cdbr-iron-east-04.cleardb.net',
  user     : 'bb9344d15cc339',
  password : '0c238b45',
  database : 'heroku_cb2952336855801'
});
 
connection.connect(
  console.log('hey, we connected to the database!');
);

app.get('/pods', function(req, res){
  res.send('responding to request');
  console.log('hey the client made a request');
}); //run a function when the client requests a list of downstream pods

//write a function that queries downstream pods 
connection.query('SELECT * FROM eWRIMS', function(err, rows, fields) {
  if (err) throw err;
 
  console.log('querying from database');
});
 
connection.end();

exports.app = app;

/////[][][][][][][][][][][][][][][][][] run server [][][][][][][][][][][][][][][][]
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server running");
});