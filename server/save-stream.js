'use strict';

const db = require('./db.js');

module.exports = (geometry) => {
  db.connect((err, client, done) => {
    if (err) throw err;
    client.query('SELECT *', (err, res) => {
      done();
      console.log(err ? err.stack : res.rows[0].message);
    })
  });
};