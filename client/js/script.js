require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
    "./js/src/geojsonlayer.js",
    "esri/layers/ArcGISTiledMapServiceLayer",
   	"esri/geometry/webMercatorUtils", 
   	"esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Multipoint",
   	"esri/symbols/SimpleMarkerSymbol",
   	"esri/geometry/Polygon",
   	"esri/symbols/SimpleFillSymbol",
   	"esri/symbols/SimpleLineSymbol", "esri/Color",
   	"esri/graphic",
   	"esri/layers/FeatureLayer",
   	"esri/layers/GraphicsLayer",
    "esri/InfoTemplate",
    "esri/SpatialReference",
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
    Polyline,
    Multipoint,
   	SimpleMarkerSymbol,
   	Polygon,
   	SimpleFillSymbol,
   	SimpleLineSymbol, Color,
   	Graphic,
  	FeatureLayer,
  	GraphicsLayer,
    InfoTemplate,
    SpatialReference,
    Query,
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
        instructions.innerHTML = "Zoom in to select the proposed point of diversion";
	    });
      // change cursor depending on zoom level
	    map.on("zoom-end", function(){
        if(!trace_api.haveTrace()){ //only do this if streamer hasn't finished tracing
          if(map.getZoom() >= 10){
            map.setMapCursor("crosshair"); //make cursor = crosshair
            instructions.innerHTML = "click within a stream to select the proposed point of diversion";
          }
          else if(map.getZoom() < 10) {
            map.setMapCursor("move");
            instructions.innerHTML = "Zoom in to select the proposed point of diversion";
          }
        }
	    });

	    map.on("click", function(evt){
	    	if(map.getZoom() >= 10 && !trace_api.haveTrace()){
	    		showCoordinates(evt); //place marker on map
          traceDownstream() //find reachcode of intersecting flowline
	    	}
	    });

	    //when container1 is clicked, compare traceline to ewrims diversion points
	    button1.addEventListener("click", function(){
	    	this.disabled = "disabled";
        queryDiverters();
	    });
	    //when button2 is clicked, get diverter info from swrcb
	    button2.addEventListener("click", function(){
        this.disabled = "disabled";
	    	swrcbRequest();
	    });
      //when container 3 is clicked, get waterbasin from usgs
      button3.addEventListener("click", function(){
        showCoordinates(evt, "basin");
      });
    };
    ////**** FUNCTION LIBRARY *****//////////////
    function showCoordinates(evt) {
      //the map is in web mercator but display coordinates in geographic (lat, long)
      mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
      //display coordinates within a new button and also on the map
      var sms = new SimpleMarkerSymbol();
      sms.setSize(10);
      sms.setStyle("STYLE_X");
      var proposed = new Graphic (new Point(evt.mapPoint), sms);
      //map.graphics.add(proposed);
    };

    var traceDownstream = function(){ //use USGS Streamer tool to trace flowline downstream from proposed POD
      trace_api.addTrace({
          "map": map,
          "x": mp.x,
          "y": mp.y,
          "traceLineColor" : [46, 138, 138, 1],
          "traceLineStyle" : "STYLE_SHORTDASHDOT",
          "originPointColor" : [46, 138, 138, 1],
          "originPoint": "infoHover",
          "clearOldTraces": true,
          //"xy_radiusM": 100 //find nearest 1:1,000,000-scale stream within 100m
      });
      if(trace_api.isTracing){
        update.style.display = "block"; //show the update container
        update.innerHTML = "Tracing flowline with USGS Streamer";
      }
      trace_api.on("trace-success", function(){
        instructions.innerHTML = "";
        button1.style.display = "block"; //show next button upon completion of trace
        map.setMapCursor("auto");
      });
    };

    var queryDiverters = function(){ // find all water right diversions within flowline extent
      //show only the diverters within the traced streams extent
      var trace = trace_api.allTraceExtents;
      var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
          SimpleMarkerSymbol.STYLE_CIRCLE).setColor(
          new Color([255,0,0,0.5]));
      var info = new InfoTemplate("Water Right POD", "Stream: {$STREAM}");

      for(var i = 1; i < ewrims.length; i++){
        var diversion = new Point([ewrims[i].FIELD19, ewrims[i].FIELD18]);
        if(trace.contains(diversion)){ //only check distance for points within the extent
          var attr = {
            STREAM: ewrims[i].FIELD22,
            FACE: ewrims[i].FIELD46
          };
          var graphic = new Graphic(diversion, sms, attr, info);
          map.graphics.add(graphic);
        }; 
      };
    };
    // var showGraphic = function(geometry){
    //   var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
    //       SimpleMarkerSymbol.STYLE_CROSS).setColor(
    //       new Color([255,0,0,0.5]));
    //   var graphic = new Graphic(geometry, sms);
    //   var info = new InfoTemplate("Water Right POD", "Stream: {$STREAM}");
    //   graphic.setInfoTemplate(info);
    //   map.graphics.add(graphic);
    // };
    // var showLayer = function(features){
    //   var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
    //     SimpleMarkerSymbol.STYLE_CROSS).setColor(
    //     new Color([255,0,0,0.5]));
    //   var featureCollection = {
    //     "layerDefinition": null,
    //     "featureSet": {
    //       "features": features,
    //       "geometryType": "esriGeometryPoint"
    //     }
    //   };
    //   featureCollection.layerDefinition = {
    //     "geometryType": "esriGeometryPoint",
    //     "objectIdField": "ObjectID",
    //     "drawingInfo": {
    //       "renderer": {
    //         "type": "simple",
    //         "symbol": sms
    //       }
    //     },
    //     "fields": [{
    //         "name": "ObjectID",
    //         "alias": "ObjectID",
    //         "type": "esriFieldTypeOID"
    //       }, {
    //       "name": "Stream",
    //       "alias": "source",
    //       "type": "esriFieldTypeString"
    //     }]
    //   };
    //   var newFeatureLayer = new FeatureLayer(featureCollection, {
    //     id: 'waterRights'
    //     //infoTemplate: info
    //   });
    //   map.addLayers([newFeatureLayer]);
    // };

    var featureServiceRequest = function(path){
      request.open("Get", "http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0/query?where=&objectIds=&time=&geometry="+path+"&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelTouches&resultType=none&distance=5&units=esriSRUnit_Meter&outFields=&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pgeojson&token=");
      request.onreadystatechange = featureServiceChange;
      request.send();
    };
    var featureServiceChange = function(){
      document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
      update.style.display = "block"; //show the update container
      update.innerHTML = "Requesting data from National Hydrography Dataset";
      if(request.readyState === 4) { //if response is ready
        document.body.style.cursor = "auto";
        update.style.display = "none";
        if(request.status === 200) { //what to do with successful response
            var response = JSON.parse(request.responseText);
            console.log(response);
            //reachCode = response.features[0].properties.ReachCode;
            showFlowLines(response);
        }
        else {
            instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
        } 
      }
    };

    // request waterbasin data from usgs based on coordinates
    function usgsRequest(){
      var usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
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
        update.style.display = "none";
        if(request.status === 200) { //what to do with successful response
            var response = JSON.parse(request.responseText);
            var watershedID = response.workspaceID;
            var watershed = response.featurecollection[1];
            drawWatershed(watershed); ////////// Draw the returned watershed on the map
        }
        else {
            instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
        } 
      }
    }; 
    // draw watershed on map
    var drawWatershed = function(){
  		var watershedLayer = new GeoJsonLayer({
    		data: watershed.feature
  		});
  		map.addLayer(watershedLayer);
  		map.setMapCursor("move");
    };
    ////////* GET THIS PARTY STARTED  *///////
    ready(initialize); //run function
});

var map = null;
var mp;
var featureServiceUrl;
var instructions = document.getElementById('instructions');
var button1= document.getElementById("button1");
var update = document.getElementById("update");
var button2 = document.getElementById("button2");
var request = new XMLHttpRequest();
var button3 = document.getElementById("button3");