var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var app = express(); 

app.use(express.static(path.resolve(__dirname, 'client'))); //send static files to client
app.use(bodyParser.json());

var mongodb = require('mongodb');
var uri = 'mongodb://heroku_ssbnr7d5:h1bmascre743f06hge003kefvm@ds059316.mlab.com:59316/heroku_ssbnr7d5';
var db; 

mongodb.MongoClient.connect(uri, function(err, database) {
  console.log('hey, we connected to the database!');
  db = database;
  app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    console.log("server running");
  });
});

app.get('/pods', function(req, res){
  console.log(req);

  res.send('responding to request');
  console.log('hey the client made a request');
  //query a list of downstream pods
  // *** ideas ****//
  // 1. plot all diverters and let the user select en masse which ones to include

  // 2. apply and query CA flowpath service for flowpath the contains the selected coordinates,
  // then query a table where the coordinates are +/- on the selected path
  // connection.query('SELECT * FROM eWRIMS', function(err, rows, fields) {
  //   if (err) throw err;
  //   console.log('querying from database');
  // });
}); 
 

exports.app = app;

/////[][][][][][][][][][][][][][][][][] run server [][][][][][][][][][][][][][][][]
