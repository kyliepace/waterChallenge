Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

- Uses esri arcGIS javascript 3.18 api to generate coordinates of proposed point of diversion

- Traces [downstream flowlines](https://txpub.usgs.gov/DSS/streamer/api/3.14/web/index.html)

- Returns list of senior water rights holders on all downstream flowlines

- User selects most-downstream senior water right holder

- Coordinates of most-downstream senior water right holder sent to [USGS streamstats](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information.

To do:
- create new graphic layer based on user selection
- show new graphic layer attributes in table
- let user delete entries from new graphic layer 
- calculate watershed area at each diversion in table
- add calendar input for seasonal withdrawals?