'use strict';

const db = require('../db.js');

module.exports = (basin) => {
  return db.connect()
  .then(client => {
    let editedBasin = basin.map(polygon => {
      return polygon.map(point => {
        return `${point[0]} ${point[1]}`;
      }).join(',');
    }).join('),(');

    let streamLineString = `ST_GeomFromText('POLYGON((${editedBasin}))', 4326)`;

    return client.query(`
      SELECT
        "APPL_ID"
        , "APPL_POD" AS pod
        , ST_AsText("pod_point")
        , "LONGITUDE"
        , "LATITUDE"
      FROM "eWRIMS_PODs_160912"
      WHERE "public".ST_DWithin("pod_point", ((${streamLineString})), 100, false)
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