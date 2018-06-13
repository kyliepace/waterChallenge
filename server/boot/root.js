'use strict';
const fs = require('fs');
const path = require('path');

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();
  //router.get('/', server.loopback.status());
  server.use(router);
};
