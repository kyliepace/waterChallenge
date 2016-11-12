require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
   	"esri/geometry/webMercatorUtils", 
   	"esri/geometry/Polygon",
   	"esri/symbols/SimpleFillSymbol",
   	"esri/symbols/SimpleLineSymbol", "esri/Color",
   	"esri/graphic",
   	"esri/layers/GraphicsLayer",
   	"dojo/dom"
], function (
    ready,
    parser,
    Map,
   	webMercatorUtils, 
   	Polygon,
   	SimpleFillSymbol,
   	SimpleLineSymbol, Color,
   	Graphic,
   	GraphicsLayer,
   	dom
) {
    ready(function () {
        parser.parse();

        var map = new Map("map", {
            basemap: "topo",
            center: [-119.4179,36.7783],
            zoom: 7,
            smartNavigation: false
        });

        map.on("load", function() {
        	map.hidePanArrows();
        	map.showZoomSlider();
            //after map loads, connect to listen to mouse move & drag events
            map.on("click", showCoordinates);
        });
        
        function showCoordinates(evt) {
            //the map is in web mercator but display coordinates in geographic (lat, long)
            var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
            //display mouse coordinates
            dom.byId("container1").innerHTML = "Calculate basin from "+ mp.x.toFixed(5) + ", " + mp.y.toFixed(5);
            dom.byId("container1").style.display = "block";
            //update url with coordinates
            usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.json?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=3310&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
        	//listen for when button is clicked to generate watershed details
	        document.getElementById("container1").addEventListener("click", function(){
				this.disabled = "disabled"; //disable button
				request.open("Get", usgsBasinUrl);
				request.send(); //send request to usgs to return water basin characteristics
			});
			request.onreadystatechange = function() {
				var update = document.getElementById("container2");
			  	if(request.readyState === 4) { //if response is ready
			 		update.style.display = "none";
			 		document.body.style.cursor = "auto";
			    	if(request.status === 200) { //what to do with successful response
			      		var response = JSON.parse(request.responseText);
			      		console.log(response);
			      		watershedID = response.workspaceID;
			      		watershed = response.featurecollection[1].feature;
			      		console.log(watershed);
			      		 /********************************************
				       * Create a polygon graphic of the watershed *
				       *********************************************/
			       		var polygonJson  = {"rings":[watershed.features[0].geometry.rings],"spatialReference":{"wkid":3310 }};
			  			var polygon = new Polygon(polygonJson);
				      	// Create a symbol for rendering the graphic
				      	var fillSymbol = new SimpleFillSymbol(
				      		SimpleFillSymbol.STYLE_SOLID,
    						new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASHDOT,
    							new Color([255,0,0]), 2),new Color([255,255,0,0.25])
				      	);
				        var watershedGraphic = new Graphic(polygon, fillSymbol) ;

				        //var watershedLayer = new GraphicsLayer();
				        //watershedLayer.add(watershedGraphic);
				        //watershedGraphic.draw();
				        map.graphics.add(watershedGraphic);
			    	} else {
			      		document.getElementById('info').innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
			    	} 
			  	}
			  	else{
			  		update.style.display = "block";
			  		update.innerHTML = "Retrieving watershed data from USGS";
			  		document.body.style.cursor = "wait";
			  	}
			};
        };
    });
});

var usgsBasinUrl;
var watershed;
var watershedID;
var request = new XMLHttpRequest();
