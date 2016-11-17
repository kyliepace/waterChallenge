require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
    "./src/geojsonlayer",
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

    var usgsRequest = function(){
		request.open("Get", usgsBasinUrl);
		request.onreadystatechange = function(){
    		var update = document.getElementById("container2");
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
		  	else{
		  		update.style.display = "block";
		  		update.innerHTML = "Retrieving watershed data from USGS";
		  		document.body.style.cursor = "wait";
		  	} 
		 }; 
	    request.send();	
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
  //   	var rings = watershed.features[0].geometry.coordinates; 
		// polygon.addRing(rings);
		// polygon.spatialReference = map.spatialReference;
  //     	// Create a symbol for rendering the graphic
  //       watershedGraphic = new Graphic(polygon, fillSymbol, {keeper: true}) ;
  //	    watershedLayer = new GraphicsLayer({id: "basin"});  
  //       watershedLayer.setScaleRange(0,0); //make sure it's visible at all scales
  //       watershedLayer.setVisibility(true);
  //       map.addLayer(watershedLayer);
  //       map.reorderLayer(watershedLayer, 1);
  //       console.log('added layer to map');
  //       watershedLayer.add(watershedGraphic);
  //       console.log('added graphic to layer');
  //       watershedLayer.redraw();

  		var geoJsonLayer = new GeoJsonLayer({
    		data: watershed
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
