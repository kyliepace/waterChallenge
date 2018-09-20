'use strict';

const db = require('./db.js');

module.exports = (stream) => {
  return db.connect()
  .then(client => {

    let editedStream = stream.map(line => {
      let splitLine = line.slice(',');
      return `${splitLine[0]} ${splitLine[1]}`;
    });

    let streamLineString = `ST_GeomFromText('MultiLineString((${editedStream}))', 4326)`;

    return client.query(`
      SELECT
        "APPL_ID"
        , "APPL_POD" AS pod
        , "pod_point"
      FROM "eWRIMS_PODs_160912"
      WHERE "public".ST_DWithin("pod_point", ((${streamLineString})), 100, false)
      ;
    `)
    .then(res => {
      client.release();
      return res.fields;
    })
    .catch(err => {
      console.log(err);
      client.release();
    })
  });
};