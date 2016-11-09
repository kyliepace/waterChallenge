require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
   	"esri/geometry/webMercatorUtils", 
   	"dojo/dom"
], function (
    ready,
    parser,
    Map,
   	webMercatorUtils, 
   	dom
) {
    ready(function () {
        parser.parse();

        var map = new Map("map", {
            basemap: "topo",
            center: [-119.4179,36.7783],
            zoom: 6
        });

        map.on("load", function() {
          //after map loads, connect to listen to mouse move & drag events
          map.on("click", showCoordinates);
        });

        function showCoordinates(evt) {
          //the map is in web mercator but display coordinates in geographic (lat, long)
          var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          //display mouse coordinates
          dom.byId("info").innerHTML = mp.x.toFixed(3) + ", " + mp.y.toFixed(3);
        };
    });
});

