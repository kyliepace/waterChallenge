Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

Uses esri arcGIS javascript 3.18 api to generate coordinates of user's click on map. Sends coordinates to [USGS streamstats api](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information.

To do:
- add pin drop to location where map is clicked
- only allow usgsRequest() when zoom is certain level
- optional: add calendar input for seasonal withdrawals
- follow waterboard policy to decide what other data inputs need to be pulled
- query list of downstream PODs
- find all senior right holders in downstream-most watershed
- sum diversion of all senior right holders