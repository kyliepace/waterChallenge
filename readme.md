Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/)

Uses esri arcGIS javascript 3.18 api to generate coordinates of user's click on map. Sends coordinates to [USGS streamstats api](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information.

To do:
- add pin drop to location where map is clicked
- only allow usgsRequest() when zoom is certain level
- optional: add calendar input for seasonal withdrawals
- follow waterboard policy to decide what other data inputs need to be pulled
- query list of downstream PODs
- find all senior right holders in downstream-most watershed
- sum diversion of all senior right holders