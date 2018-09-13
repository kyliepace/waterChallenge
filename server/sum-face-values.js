'use strict';

const db = require('./db.js');

module.exports = (basin, points) => {
  db.connect()
  .then(client => {

    Promise.all(points.map(point => {

      // do I need to use ST_GeomFromText?
      let geomText = `POLYGON((${point.basin}))`;

      // find points within each basin
      // there will be some redundancy here...possible refactor
      return client.query(`
        SELECT pod, acf
        FROM ewrims
        WHERE ST_Within(ewrims.pod, ${geomText})
      `)
    }))
    .then(res => {
      client.release();
      return res.rows;
    })
    // .then((rights) => {
    //   Promise.all(points.map(point => {
    //     // find all results within the point.basin
    //     let basinText = `POLYGON((${point.basin}))`;

    //     // will need to flatten rights.rows into an array of the pod values
    //     let rightsText = `MULTIPOINT(${rights.rows.pod})`;

    //     return client.query(`
    //       SELECT rights
    //       FROM (
    //         SELECT ST_GeomFromText(${basinText}) AS basin,
    //         SELECT ST_GeomFromText(${rightsText}) AS rights
    //       )
    //       WHERE ST_Within(
    //         basin,
    //         SELECT ST_GeomFromText(${basinText})
    //       );
    //     `)
    //   }))
      // .then(res => {
      //   return res.rows;
      // })
      // .catch(err => {
      //   console.log(err);
      // });
    })
    .catch(err => {
      client.release();
      console.log(err);
    });
  });
};