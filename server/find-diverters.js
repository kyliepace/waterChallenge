'use strict';

const db = require('./db.js');

module.exports = (stream) => {
  db.connect()
  .then(client => {
    let streamText = `ST_GeomFromGeoJSON({
      type: 'MultiLineString',
      coordinates: ${stream}
    })`;

    return client.query(`
      SELECT pod, acf, elevation
      FROM ewrims
      LEFT JOIN streams ON ST_DWithin(
        ewrims.pod,
        ${streamText},
        100,
        false
      )
      ORDER BY elevation ASC
      ;
    `);
  })
  .then(res => {
    client.release();
    console.log('queried points of diversions against selected stream', res.rows[0]);
    return res.rows[0];
  })
  .catch(err => {
    client.release();
    console.log(err);
  });

  // alternative way of setting up client:

  /*
  db.connect((err, client, done) => {
    if (err) throw err;
    client.query('SELECT *', (err, res) => {
      done();
      console.log(err ? err.stack : res.rows[0].message);
    })
  });
  */
};