"use strict";
const router = require("express").Router();
const renderClient = require('./render-client.js');
const findDiverters = require('./find-diverters.js');
const sumValues = require('./sum-face-values.js');

const routes = () => {

  router.post(
    "/find-diverters",
    (req, res) => {
      findDiverters(req.geometry)
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