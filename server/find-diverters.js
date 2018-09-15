'use strict';

const db = require('./db.js');

module.exports = (stream) => {
  return db.connect()
  .then(client => {

    let editedStream = stream.map(line => {
      let splitLine = line.slice(',');
      return `${splitLine[0]} ${splitLine[1]}`;
    });

    let streamLineString = `ST_GeomFromText('MultiLineString(${editedStream}, 4326)')`;
    console.log(streamLineString);

    return client.query(`
      SELECT "APPL_ID", "APPL_POD", "LATITUDE", "LONGITUDE"
      FROM "eWRIMS_PODs_160912" AS ewrims
      WHERE ST_DWithin("APPL_POD", ((${streamLineString})), 100, false)
      ;
    `)
    .then(res => {
      client.release();
      return res.rows;
    })
    .catch(err => {
      console.log(err);
      client.release();
    })
  });
};