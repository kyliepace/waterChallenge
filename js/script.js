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

        var usgsBasinUrl;
        function showCoordinates(evt) {
          //the map is in web mercator but display coordinates in geographic (lat, long)
          var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
          //display mouse coordinates
          dom.byId("container1").innerHTML = "Calculate basin from "+ mp.x.toFixed(5) + ", " + mp.y.toFixed(5);
          dom.byId("container1").style.display = "inline";
          usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.json?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=3310&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true'
        
          document.getElementById("container1").addEventListener("click", function(){
          	request.open("Get", usgsBasinUrl);
          	request.send(); //send request to usgs to return water basin characteristics
          	//make page show that it's loading data 
          	this.disabled = "disabled"; //disable button
          });
          //can I show the returned polygon on the map and change the "container1" button's text and function?
        };
    });
});


var request = new XMLHttpRequest();
 
request.onreadystatechange = function() {
  if(request.readyState === 4) { //if response is ready
 	
    if(request.status === 200) { 
      //what to do with successful response
      var response = JSON.parse(request.responseText);
      console.log(response);
      return response;
    } else {
      document.getElementById('info').innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
    } 
  }
};