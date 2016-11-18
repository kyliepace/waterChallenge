Created for the [California Water Data Challenge](http://waterchallenge.data.ca.gov/).

The goal of this app is to assist Permitting & Licensing in generating a Water Supply Report for a proposed diversion.

Uses esri arcGIS javascript 3.18 api to generate coordinates of user's click on map. Sends coordinates to [USGS streamstats api](http://streamstatsags.cr.usgs.gov/streamstatsservices/#/) to return watershed and streamflow information.

To do:
- add calendar input for seasonal withdrawals?
- migrate to cloud9: this is gonna be server-side!
- php to query downstream senior rights from selected outlet from mySQL database?
- draw watershed of downstream-most senior right holder
- find all senior right holders in downstream-most watershed
- sum diversion of all senior right holders
- get Austin & Matt to confirm this process