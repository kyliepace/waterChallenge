'use strict';

const db = require('./db.js');

module.exports = (basin, points) => {
  db.connect()
  .then(client => {
    let geomText = `POLYGON((${basin}))`;
    // do I need to use ST_GeomFromText?
    return client.query(`
      SELECT pod, acf
      FROM ewrims
      WHERE ST_Within(ewrims.pod, ${geomText})
    `)
    .then((rights) => {
      Promise.all(points.map(point => {
        // find all results within the point.basin
        let basinText = `POLYGON((${point.basin}))`;

        // will need to flatten rights.rows into an array of the pod values
        let rightsText = `MULTIPOINT(${rights.rows.pod})`;

        return client.query(`
          SELECT rights
          FROM (
            SELECT ST_GeomFromText(${basinText}) AS basin,
            SELECT ST_GeomFromText(${rightsText}) AS rights
          )
          WHERE ST_Within(rights, basin);
        `)
      }))
      .then(res => {
        return res.rows;
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      client.release();
      console.log(err);
    });
  });
};