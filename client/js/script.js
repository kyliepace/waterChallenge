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
   	dom
) {
    function initialize (){
      parser.parse();
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
    		SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
				   SimpleLineSymbol.STYLE_SOLID,
				   new Color([255,0,0,1]), 
				   200
		     ),
			   new Color([255,255,0,1]) 
		  );
		  //when map has loaded, remove the pan arrows and zoom slider
	    map.on("load", function() {
	    	map.hidePanArrows();
	    	map.showZoomSlider();
	    	map.setMapCursor("move");
	    });
      // change cursor depending on zoom level
	    map.on("zoom-end", function(){
	    	if(map.getZoom() >= 10){
	    		map.setMapCursor("crosshair"); //make cursor = crosshair
	    		instructions.innerHTML = "click within a stream to select the proposed point of diversion";
	    	}
        else{
          map.setMapCursor("move");
          instructions.innerHTML = "Zoom in to select the proposed point of diversion";
        }
	    });

	    map.on("click", function(evt){
	    	if(map.getZoom() >= 10){
	    		showCoordinates(evt, "flow");
	    	}
	    });

	    //when container1 is clicked, send coordinates to arcgis server to find flowline
	    coordButton.addEventListener("click", function(){
	    	this.disabled = "disabled";
	    	featureServiceRequest();
	    });
	    //when container2 is clicked, get diverter info from swrcb
	    container2.addEventListener("click", function(){
	    	swrcbRequest();
	    });
      //when container 3 is clicked, get waterbasin from usgs
      container3.addEventListener("click", function(){
        showCoordinates(evt, "basin");
      });
    };


    ////**** FUNCTION LIBRARY *****//////////////
    var featureServiceRequest = function(){
      request.open("Get", featureServiceUrl);
      request.onreadystatechange = featureServiceChange;
      request.send();
    };
    var featureServiceChange = function(){
      document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
      update.style.display = "block"; //show the update container
      update.innerHTML = "Finding flowline from National Hydrography Dataset";
      if(request.readyState === 4) { //if response is ready
        document.body.style.cursor = "auto";
        if(request.status === 200) { //what to do with successful response
            update.style.display = "none";
            var response = JSON.parse(request.responseText);
            showFlowLines(response);
            container3.innerHTML = "Get water rights data"
        }
        else {
            update.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
        } 
      }
    };
    function usgsRequest(){
      request.open("Get", usgsBasinUrl);
      request.onreadystatechange = usgsStateChange;
	    request.send();	
    };

    function usgsStateChange(){
  		document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
  		update.style.display = "block"; //show the update container
	  	update.innerHTML = "Retrieving watershed data from USGS";
		  if(request.readyState === 4) { //if response is ready
   			document.body.style.cursor = "auto";
  			if(request.status === 200) { //what to do with successful response
            update.style.display = "none";
    				var response = JSON.parse(request.responseText);
    				watershedID = response.workspaceID;
    				watershed = response.featurecollection[1];
    				drawWatershed(); ////////// Draw the returned watershed on the map
  			}
  			else {
        		update.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
      	} 
	  	}
	  }; 

    function showCoordinates(evt, func) {
    	//the map is in web mercator but display coordinates in geographic (lat, long)
        mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        //display coordinates within a new button and also on the map
        var sms = new SimpleMarkerSymbol();
        sms.setSize(10);
        sms.setStyle("STYLE_X");
        
        if(func === 'flow'){
          var diversion = new Graphic (new Point(evt.mapPoint), sms);
          map.graphics.add(diversion);
          // make tolerance envelope
          var xmin = (mp.x) - 0.00025;
          var ymin = (mp.y) - 0.00025;
          var xmax = (mp.x) + 0.00025;
          var ymax = (mp.y) + 0.00025;
          //update featureServiceUrl
          featureServiceUrl = "http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0/query?where=&objectIds=&time=&geometry="+xmin+"%2C+"+ymin+"%2C+"+xmax+"%2C+"+ymax+"&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=5&units=esriSRUnit_Meter&outFields=&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pgeojson&token=";
          // show button for next step
          coordButton.innerHTML = "Find flowline";
          coordButton.style.display = "block";
        }
        else if(func === 'basin'){
          var senior = new Graphic (new Point(evt.mapPoint), sms);
          map.graphics.add(senior);
          //update url with coordinates
          usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
        }
    };

    var showFlowLines = function(results){
      var flowlineLayer = new GeoJsonLayer({
        data: results
      });
      map.addLayer(flowlineLayer);
      map.setMapCursor("move");
    };

    var drawWatershed = function(){
  		var watershedLayer = new GeoJsonLayer({
    		data: watershed.feature
  		});
  		map.addLayer(watershedLayer);
  		map.setMapCursor("move");
    };

    var swrcbRequest = function(){
    	//send flowline info to server to get swrcb list of diverters
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
var featureServiceUrl;
var watershed;
var polygon;
var fillSymbol;
var watershedID;
var watershedGraphic;
var watershedLayer;
var instructions = document.getElementById('instructions');
var coordButton = document.getElementById("container1");
var update = document.getElementById("update");
var container2 = document.getElementById("container2");
var request = new XMLHttpRequest();
var container3 = document.getElementById("container3");