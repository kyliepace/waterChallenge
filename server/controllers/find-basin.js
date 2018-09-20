'use strict';
const axios = require('axios');

module.exports = (point) => {
  return axios.get(`https://streamstats.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation=${point[0]}&ylocation=${point[1]}&crs=102100&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true`)
}