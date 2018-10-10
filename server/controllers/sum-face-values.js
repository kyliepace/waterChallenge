'use strict';

const db = require('../db.js');

module.exports = (basin) => {
  return db.connect()
  .then(client => {

    // GET ALL RIGHTS IN THE WATERSHED
    let editedBasin = basin.map(polygon => {
      let polygonPoints = polygon.map(point => {
        return `${point[0]} ${point[1]}`;
      }).join(',');
      return `(${polygonPoints})`;
    }).join(',');

    let geomText = `ST_GeomFromText('MULTIPOLYGON((${editedBasin}))', 4326)`;

    return client.query(`
      SELECT
        "APPL_POD" AS pod
        , ST_AsText("pod_point")
        , "FACE_VALUE_AMOUNT"
        , "DIVERSION_TYPE"
        , "DIRECT_DIV_AMOUNT"
        , "DIVERSION_AC_FT"
        , "WR_TYPE"
      FROM "eWRIMS_PODs_160912"
      WHERE "public".ST_DWithin("pod_point", (${geomText}), 100, false);
    `)
    .then(res => {
      client.release();
      return res.rows;
    })
    .catch(err => {
      client.release();
      console.log(err);
    })
  });
};