'use strict';
const { Pool, Client } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
});

module.exports = pool;