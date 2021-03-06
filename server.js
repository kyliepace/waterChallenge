'use strict';
const express = require("express");
const dotenv = require('dotenv');
const bodyParser = require("body-parser");
const routes = require('./server/routes');
const expressStaticGzip = require("express-static-gzip");

let server = express();
dotenv.config();
server.use(bodyParser.json({limit: '5mb'}));
server.use("/", expressStaticGzip("client/dist"));
server.use(express.static("client/dist"))

server.use('/', routes());;

let port = process.env.PORT || '3000';
server.listen(port, () => {
  console.log(
    "Starting server in " +
      process.env.NODE_ENV +
      " mode: Listening on " +
      port
  );
});