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
 
connection.connect( function(){
  console.log('hey, we connected to the database!');
});

app.get('/pods', function(req, res){
  res.send('responding to request');
  console.log('hey the client made a request');
  //query a list of downstream pods
  // *** ideas ****//
  // 1. plot all diverters and let the user select en masse which ones to include

  // 2. apply and query CA flowpath service for flowpath the contains the selected coordinates,
  // then query a table where the coordinates are +/- on the selected path
  connection.query('SELECT * FROM eWRIMS', function(err, rows, fields) {
    if (err) throw err;
    console.log('querying from database');
  });
}); 
 
connection.end();

exports.app = app;

/////[][][][][][][][][][][][][][][][][] run server [][][][][][][][][][][][][][][][]
app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  console.log("server running");
});