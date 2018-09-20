"use strict";
const router = require("express").Router();
const renderClient = require('./render-client.js');
const findDiverters = require('./controllers/find-diverters');
const sumValues = require('./controllers/sum-face-values');
const findBasin = require('./controllers/find-basin');

const routes = () => {

  router.post('/find-basin', (req, res) => {
    findBasin(req.body.point)
    .then(data => {
      res.status(200).json(data.data.featurecollection);
    })
    .catch(err => {
      console.log(err.message);
      res.status(err.statusCode || 500).json(err.body);
    })
  });

  router.post(
    "/find-diverters",
    (req, res) => {
      findDiverters(req.body.geometry)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch(err => {
        console.log(err);
        res.status(err.statusCode || 500).json(err);
      })
    }
  );

  router.get('/sum-face-values', (req, res) => {
    sumValues(req.basin, req.points)
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(err.statusCode || 500).json(err);
    })
  });

  router.get("/*", renderClient);

  return router;
};

module.exports = routes;