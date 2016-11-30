Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

- Uses esri arcGIS javascript 3.18 api to generate coordinates of proposed point of diversion

- Traces [downstream flowline](https://txpub.usgs.gov/DSS/streamer/api/3.14/web/index.html)

- Returns list of appropriative water rights holders on downstream flowline. In the future, there could be an option for the user to select which types of rights to query - or return all types

- User selects which water rights to include

- Coordinates of selected rights sent to [USGS streamstats](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information

- Face amount of all diversions within each water right's watershed are summed

To do:
- show available usgs stream gages
- snap selectedLayer graphics to flowline
- tally diversions of all water rights holders in each watershed in downstreamRights array
- request [flow statistics](http://streamstatsags.cr.usgs.gov/streamstatsservices/) for each diversion 
- produce table of results for user to download
- hover on diversion in table zooms to point on map