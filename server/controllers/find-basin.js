'use strict';
const axios = require('axios');

module.exports = (point) => {
  return axios.get(`https://streamstats.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation=${point.x}&ylocation=${point.y}&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true`)
}