var datasources = {
  "elephantSQL": {
    "host": "\ttantor.db.elephantsql.com",
    "port": 5432,
    "url": process.env.db_url,
    "connector": "postgresql"
  }
}
module.exports = datasources;