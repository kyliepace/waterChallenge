Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

Team Will Code 4 Froude is Kylie Pace, Matt Bray, and Austin Hall.

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

- Uses esri arcGIS javascript 3.18 api to generate coordinates of proposed point of diversion

- Traces [downstream flowline](https://txpub.usgs.gov/DSS/streamer/api/3.14/web/index.html) of 1:1,000,000-scale streams

- Returns list of appropriative water rights holders on downstream flowline. In the future, there could be an option for the user to select which types of rights to query - or return all types

- User selects which water rights to include

- Coordinates of selected rights sent to [USGS streamstats](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information

- Face amount of all appropriative, active diversions within each water right's watershed are queried from SWRCB data and their face value diversions (in acre-feet/year) are summed

- Ideally this would be a fullstack project so the user could download the resulting table

To do:
- show available usgs stream gages
- snap selectedLayer graphics to flowline
- request [flow statistics](http://streamstatsags.cr.usgs.gov/streamstatsservices/) for each diversion 
- hover on diversion in table zooms to point on map