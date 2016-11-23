Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

- Uses esri arcGIS javascript 3.18 api to generate coordinates of proposed point of diversion

- Returns [flowline](http://www.arcgis.com/home/item.html?id=6510f031d0a74f6ab879fe73895164eb#overview) that touches coordinates

- Finds all downstream flowlines

- Returns list of senior water rights holders on all downstream flowlines

- User selects most-downstream senior water right holder

- Coordinates of most-downstream senior water right holder sent to [USGS streamstats](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information.

To do:
- find all downstream flowlines
- query water rights on all downstream flowlines
- plot returned water rights
- draw watershed of downstream-most senior right holder
- add calendar input for seasonal withdrawals?
- style geojson?