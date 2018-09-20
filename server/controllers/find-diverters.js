'use strict';

const db = require('../db.js');

module.exports = (basin) => {
  return db.connect()
  .then(client => {

    let editedBasin = basin[0].map(polygon => {
      let editedPolygon = polygon.map(point => {
        let splitPoint = point.slice(',');
        return `${splitPoint[0]} ${splitPoint[1]}`;
      }).join(',');
      return '(' + editedPolygon + ')';
    }).join(',');

    let streamLineString = `ST_GeomFromText('MultiPolygon(${editedBasin})', 102100)`;

    return client.query(`
      SELECT
        "APPL_ID"
        , "APPL_POD" AS pod
        , ST_AsText("pod_point")
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