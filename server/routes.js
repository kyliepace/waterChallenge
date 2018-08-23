"use strict";
const router = require("express").Router();
const renderClient = require('./render-client.js');
const saveStream = require('./save-stream.js');
const findDiverters = require('./find-diverters.js');

const routes = () => {

  router.post(
    "/save-stream",
    (req, res) => {
      saveStream(req.geometry)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(err => {
        console.log(err);
        res.status(err.statusCode || 500).json(err);
      });
    }
  );


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

  router.get("/*", renderClient);

  return router;
};

module.exports = routes;