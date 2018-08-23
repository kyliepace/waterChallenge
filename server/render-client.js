"use strict";

const fs = require("fs");
const path = require("path");

// const env = require("../config/env").env;

// let indexHtmlPage;
// if (env === "development" || env === "test") {
//   indexHtmlPage = "index.dev.html";
// } else {
//   indexHtmlPage = "index.html";
// }

let indexHtmlPage = "index.html";

const indexPath = path.resolve(`${__dirname}/../client/dist/${indexHtmlPage}`);
let layout = fs.readFileSync(indexPath).toString();

module.exports = (req, res) => {
  res.send(layout);
};
