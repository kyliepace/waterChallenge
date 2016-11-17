require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
    "./js/src/geojsonlayer.js",
    "esri/layers/ArcGISTiledMapServiceLayer",
   	"esri/geometry/webMercatorUtils", 
   	"esri/SpatialReference",
   	"esri/geometry/Polygon",
   	"esri/symbols/SimpleFillSymbol",
   	"esri/symbols/SimpleLineSymbol", "esri/Color",
   	"esri/graphic",
   	"esri/layers/FeatureLayer",
   	"esri/layers/GraphicsLayer",
   	"dojo/dom"
], function (
    ready,
    parser,
    Map,
    GeoJsonLayer,
    ArcGISTiledMapServiceLayer,
   	webMercatorUtils, 
   	SpatialReference,
   	Polygon,
   	SimpleFillSymbol,
   	SimpleLineSymbol, Color,
   	Graphic,
  	FeatureLayer,
  	GraphicsLayer,
   	dom
) {
    function initialize (){
    	map = new Map("map", {
	        basemap: "topo",
	        center: [-119.4179,36.7783],
	        zoom: 7,
	        smartNavigation: false,
	        spatialReference:  4326
	    });
	    console.log('created map');
	    polygon = new Polygon();
	    fillSymbol = new SimpleFillSymbol(
      		SimpleFillSymbol.STYLE_SOLID,
			new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([255,0,0,1]), 
					200
			),
			new Color([255,255,0,1]) 
		);
		
	    map.on("load", function() {
	    	map.hidePanArrows();
	    	map.showZoomSlider();
	    });

	    map.on("click", function(evt){
	    	showCoordinates(evt);
	    });

	    //when container1 is clicked, send coordinates to usgs to return watershed info
	    document.getElementById("container1").addEventListener("click", function(){
	    	this.disabled = "disabled";
	    	usgsRequest(); 
	    });
	    //when container3 is clicked, get diverter info from swrcb
	    document.getElementById("container3").addEventListener("click", function(){
	    	swrcbRequest();
	    });
    };

    function usgsRequest(){
		request.open("Get", usgsBasinUrl);
		
	    request.send();	

	    request.onreadystatechange = function(){
    		var update = document.getElementById("container2");
    		document.body.style.cursor = "wait";
    		update.style.display = "block";
		  	update.innerHTML = "Retrieving watershed data from USGS";
    		
    		if(request.readyState === 4) { //if response is ready
	 			update.style.display = "none";
	 			document.body.style.cursor = "auto";
	 			container3.style.display = "block";
    			if(request.status === 200) { //what to do with successful response
      				var response = JSON.parse(request.responseText);
      				watershedID = response.workspaceID;
      				watershed = response.featurecollection[1];
      				console.log(watershed);
      				drawWatershed();
      				container3.innerHTML = "Get water rights data"
				}
				else {
	      			document.getElementById('info').innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
	    		} 
		  	}
		 }; 
    };
    function showCoordinates(evt) {
    	//the map is in web mercator but display coordinates in geographic (lat, long)
        var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
        dom.byId("container1").innerHTML = "Calculate basin from "+ mp.x.toFixed(5) + ", " + mp.y.toFixed(5);
        dom.byId("container1").style.display = "block";
        //update url with coordinates
        usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
    };

    var drawWatershed = function(){
  		var geoJsonLayer = new GeoJsonLayer({
    		data: watershed.feature
		});

		map.addLayer(geoJsonLayer);
    };

    var swrcbRequest = function(){
    	//send request to swrcb
    	request = new XMLHttpRequest();
    	request.onreadystatechange = function(){
    		if(request.readyState === 4) { //if response is ready
    			document.body.style.cursor = "auto";
	    			if(request.status === 200) { //what to do with successful response
	      				var response = JSON.parse(request.responseText);
	      				response.addHeader("Access-Control-Allow-Origin", "*");
	      				console.log(response);
    				}
    				else {
		      			document.getElementById('info').innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
		    		} 
		  	}
		  	else{
		  		document.body.style.cursor = "wait";
		  	} 
		}; 
    	var swrcbUrl = "http://ciwqs.waterboards.ca.gov/ciwqs/ewrims/EWServlet?Page_From=EWWaterRightPublicSearch.jsp&Redirect_Page=EWWaterRightPublicSearchResults.jsp&Object_Expected=EwrimsSearchResult&Object_Created=EwrimsSearch&Object_Criteria=&Purpose=&subTypeCourtAdjSpec=&subTypeOtherSpec=&appNumber=&permitNumber=&licenseNumber=&waterHolderName=&source=&hucNumber=&watershed=RUSSIAN+RIVER";
    	request.open('GET', swrcbUrl, true);
    	request.send();
    	// http://ciwqs.waterboards.ca.gov/ciwqs/ewrims/EWServlet?Page_From=EWWaterRightPublicSearch.jsp&Redirect_Page=EWWaterRightPublicSearchResults.jsp&Object_Expected=EwrimsSearchResult&Object_Created=EwrimsSearch&Object_Criteria=&Purpose=&subTypeCourtAdjSpec=&subTypeOtherSpec=&appNumber=&permitNumber=&licenseNumber=&waterHolderName=&source=&hucNumber=&watershed=RUSSIAN+RIVER
    	
    };

    ready(initialize); //run function
});

var map = null;
var usgsBasinUrl;
var watershed;
var polygon;
var fillSymbol;
var watershedID;
var watershedGraphic;
var watershedLayer;
var container3 = document.getElementById("container3");
var request = new XMLHttpRequest();
