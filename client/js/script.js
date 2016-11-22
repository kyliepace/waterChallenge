require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
    "./js/src/geojsonlayer.js",
    "esri/layers/ArcGISTiledMapServiceLayer",
   	"esri/geometry/webMercatorUtils", 
   	"esri/geometry/Point",
   	"esri/symbols/SimpleMarkerSymbol",
   	"esri/geometry/Polygon",
   	"esri/symbols/SimpleFillSymbol",
   	"esri/symbols/SimpleLineSymbol", "esri/Color",
   	"esri/graphic",
   	"esri/layers/FeatureLayer",
   	"esri/layers/GraphicsLayer",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
   	"dojo/dom"
], function (
    ready,
    parser,
    Map,
    GeoJsonLayer,
    ArcGISTiledMapServiceLayer,
   	webMercatorUtils, 
   	Point,
   	SimpleMarkerSymbol,
   	Polygon,
   	SimpleFillSymbol,
   	SimpleLineSymbol, Color,
   	Graphic,
  	FeatureLayer,
  	GraphicsLayer,
    QueryTask,
    Query,
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
	    	map.setMapCursor("move");
        //swrcbRequest() //for testing purposes put this here
	    });

	    map.on("zoom-end", function(){
	    	if(map.getZoom() >= 15){
	    		map.setMapCursor("crosshair"); //make cursor = crosshair
	    		instructions.innerHTML = "click within a stream to select the proposed point of diversion";
	    	}
        else{
          map.setMapCursor("move");
          instructions.innerHTML = "Zoom in to select the proposed point of diversion";
        }
	    });

	    map.on("click", function(evt){
	    	console.log(map.getZoom());
	    	if(map.getZoom() >= 15){
	    		showCoordinates(evt);
          flowlineQuery(); //for testing purposes run this here
	    	}
	    });

	    //when container1 is clicked, send coordinates to usgs to return watershed info
	    document.getElementById("container1").addEventListener("click", function(){
	    	this.disabled = "disabled";
	    	usgsRequest(); 
        // query flowline service for flowline containing the mp
        flowlineQuery();
        // plot returned flowline(s)
	    });
	    //when container3 is clicked, get diverter info from swrcb
	    document.getElementById("container3").addEventListener("click", function(){
	    	swrcbRequest();
	    });
    };

    function usgsRequest(){
		  request.open("Get", usgsBasinUrl);
      request.onreadystatechange = usgsStateChange;
	    request.send();	
    };

    //if usgsStateChange doesn't work like this, I may have to define request.onreadystatechange outside of
    // the usgsRequest function
    function usgsStateChange(){
    	console.log('request state change');
  		document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
  		update.style.display = "block"; //show the update container
	  	update.innerHTML = "Retrieving watershed data from USGS";
		  if(request.readyState === 4) { //if response is ready
   			update.style.display = "none";
   			document.body.style.cursor = "auto";
   			container3.style.display = "block";
  			if(request.status === 200) { //what to do with successful response
    				var response = JSON.parse(request.responseText);
    				watershedID = response.workspaceID;
    				watershed = response.featurecollection[1];
    				drawWatershed(); ////////// Draw the returned watershed on the map
    				container3.innerHTML = "Get water rights data"
  			}
  			else {
        		instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
      	} 
	  	}
	 }; 

    function showCoordinates(evt) {
    	//the map is in web mercator but display coordinates in geographic (lat, long)
        mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        //display coordinates within a new button and also on the map
        var sms = new SimpleMarkerSymbol();
        sms.setSize(10);
        sms.setStyle("STYLE_CIRCLE");
        var graphic = new Graphic (new Point(evt.mapPoint), sms);
        map.graphics.add(graphic);
        coordButton.innerHTML = "Calculate basin from "+ mp.x.toFixed(5) + ", " + mp.y.toFixed(5);
        coordButton.style.display = "block";
        //update url with coordinates
        usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
    };

    var flowlineQuery = function(){
      console.log(mp);
      //build tolerance envelope around click
      var mapWidth = map.extent.getWidth();
      var pixelWidth = mapWidth/map.width;
      var tolerance = 10 * pixelWidth;
      var queryExtent = new esri.geometry.Extent(1,1,tolerance,tolerance,4326);
      //initialize query task
      queryTask = new QueryTask("http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0");
      //initialize query
      query = new Query();
      query.geometry = queryExtent.centerAt(mp);
      query.units = "meters";
      query.distance = 5; //give query a buffer of 5 meters from the selected coordinates
      query.returnGeometry = true;
      //query.geometryPrecision = 1;
      query.spatialRelationship = Query.SPATIAL_REL_TOUCHES;
      //query.where = //"FIELD = 'string' "; 
      //query.outFields = ["ReachCode"];
      queryTask.execute(query, showResults, showError);
    };

    var showResults = function(featureSet){
      //Performance enhancer - assign featureSet array to a single variable.
      var resultFeatures = featureSet.features;
      //Loop through each feature returned
      console.log(featureSet);
      for (var i=0, il=resultFeatures.length; i<il; i++) {
        //Get the current feature from the featureSet.
        //Feature is a graphic
        var graphic = resultFeatures[i];
        graphic.setSymbol(symbol);

        //Set the infoTemplate.
        graphic.setInfoTemplate(infoTemplate);

        //Add graphic to the map graphics layer.
        map.graphics.add(graphic);
      }
    };

    var showError = function(error){
      console.log(error);
    };

    var drawWatershed = function(){
  		var geoJsonLayer = new GeoJsonLayer({
    		data: watershed.feature
  		});
  		map.addLayer(geoJsonLayer);
  		map.setMapCursor("move");
    };

    var swrcbRequest = function(){
    	//send request to server for swrcb ewrims data
      request.open('GET', '/pods', true);
    	request.onreadystatechange = function(){
        document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
        update.style.display = "block"; //show the update container
        update.innerHTML = "Retrieving water rights data from State Water Rights Control Board";
    		if(request.readyState === 4) { //if response is ready
    			document.body.style.cursor = "auto";
          update.style.display = "none";
    			if(request.status === 200) { //what to do with successful response
      				var response = JSON.parse(request.responseText);
      				console.log(response);
  				}
  				else {
	      			instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
	    		} 
		  	}
		  	else{
		  		document.body.style.cursor = "wait";
		  	} 
  		}; 
      // send request with flowline and coordinates. server should return list of downstream diverters on that flowline
      request.send();
    };

    ////////* GET THIS PARTY STARTED  *///////
    ready(initialize); //run function
});

var map = null;
var mp;
var usgsBasinUrl;
var watershed;
var polygon;
var fillSymbol;
var watershedID;
var watershedGraphic;
var watershedLayer;
var instructions = document.getElementById('instructions');
var coordButton = document.getElementById("container1");
var update = document.getElementById("update");
var container3 = document.getElementById("container3");
var request = new XMLHttpRequest();
