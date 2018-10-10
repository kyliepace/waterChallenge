"use strict";
const router = require("express").Router();
const renderClient = require('./render-client.js');
const findDiverters = require('./controllers/find-diverters');
const sumValues = require('./controllers/sum-face-values');
const findBasin = require('./controllers/find-basin');

const routes = () => {

  router.post(
    "/find-diverters",
    (req, res) => {
      console.log('/find-diverters ', new Date());
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

  router.post('/find-basin', (req, res) => {
    let x = req.body.point.x.toString();
    let y = req.body.point.y.toString();

    console.log('/find-basin at point ' + x + ', ' + y, new Date());

    findBasin(req.body.point)
    .then(usgs => {
      let fc = usgs.data.featurecollection;
      let basin = [];

      if (fc.length > 1) {
        basin = fc[1].feature.features[0].geometry.coordinates;
      };
      console.log('basin generated');
      res.status(200).json(basin);
    })
    .catch(err => {
      console.log(err.message);
      res.status(err.statusCode || 500).json(err.body);
    })
  });

  router.post('/sum-face-values', (req, res) => {
    console.log('/sum-face-values ', new Date());
    sumValues(req.body.basin)
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