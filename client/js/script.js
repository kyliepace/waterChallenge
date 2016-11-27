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
    "esri/geometry/geometryEngine",
    "esri/tasks/GeometryService",
    "esri/SpatialReference",
    "esri/tasks/query",
    "esri/tasks/DistanceParameters",
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
    geometryEngine,
    GeometryService,
    SpatialReference,
    Query,
    DistanceParameters,
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
	    	if(map.getZoom() >= 10){
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
      var diversion = new Graphic (new Point(evt.mapPoint), sms);
      //map.graphics.add(diversion);
    };

    var traceDownstream = function(){
      //trace downstream
      trace_api.addTrace({
          "map": map,
          "x": mp.x,
          "y": mp.y,
          "traceLineColor" : [46, 138, 138, 1],
          "traceLineStyle" : "STYLE_SHORTDASHDOT",
          "originPointColor" : [46, 138, 138, 1],
          "originPoint": "infoHover",
          "clearOldTraces": true
      });
      while(trace_api.isTracing){
        update.style.display = "block"; //show the update container
        update.innerHTML = "Tracing flowline with USGS Streamer";
      }
      trace_api.on("trace-success", function(){
        instructions.innerHTML = "";
        button1.style.display = "block"; //show next button upon completion of trace
        map.setMapCursor("move");
      });
    };

    var queryDiverters = function(){
      //build a polyline of the traced streams
      var traceGraphics = map._layers.tracePolyLine.graphics;
      var tracePaths = []; //flatten the trace_api paths into one array
      for(var j = 0; j < traceGraphics.length; j++){
        for(var n = 0; n < traceGraphics[j].geometry.paths[0].length; n++){
          tracePaths.push(traceGraphics[j].geometry.paths[0][n]); //push each coordinate pair into the array
        }
      }
      //build array into a polyline geometry
      var tracePolyline = new Polyline(tracePaths);
      tracePolyline.setSpatialReference(new SpatialReference(102100));

      //show only the diverters within the traced streams extent
      var multipoint = new Multipoint(new SpatialReference({ wkid:4326 }));
      var waterRights = []; //create array to copy water right info
      var trace = trace_api.allTraceExtents;
      
      var sum = 0;
      var distParams = new DistanceParameters();
      var geometryService = new GeometryService("https://utility.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
      for(var i = 1; i < ewrims.length; i++){
        var diversion = new Point([ewrims[i].FIELD19, ewrims[i].FIELD18]);
        if(trace.contains(diversion)){ //only check distance for points within the extent
          
          distParams.distanceUnit = GeometryService.UNIT_STATUTE_METER;
          distParams.geodesic = false; 
          distParams.geometry1 = tracePolyline;
          distParams.geometry2 = diversion;
          geometryService.distance(distParams,function(distance){
            if(typeof(distance) == "number"){
              return sum = sum + distance;
              
            }
          });
          multipoint.addPoint(diversion);
        }; 
      };
      console.log(sum);
      console.log('average: '+ sum/multipoint.points.length);

      var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
        SimpleMarkerSymbol.STYLE_CROSS).setColor(
        new Color([255,0,0,0.5]));
      var graphic = new Graphic(multipoint, sms);
      map.graphics.add(graphic);
      tableDiverters(waterRights);

      // if(distance < 10){
            //   console.log(diversion);
            //   multipoint.addPoint(diversion); //only add point if distance less than 10 meters to stream
            //   // var waterRight = {
            //   //   ObjectID: ewrims[i].FIELD1,
            //   //   PodID: ewrims[i].FIELD2,
            //   //   AppID: ewrims[i].FIELD3,
            //   //   Quarter: ewrims[i].FIELD12
            //   // };
            //   // waterRights.push(waterRight);
            // }
    };

    function getStd(values){
      var avg = average(values);
      
      var squareDiffs = values.map(function(value){
        var diff = value - avg;
        var sqrDiff = diff * diff;
        return sqrDiff;
      });
      
      var avgSquareDiff = average(squareDiffs);

      var stdDev = Math.sqrt(avgSquareDiff);
      return stdDev;
    };

    function average(data){
      var sum = data.reduce(function(sum, value){
        return sum + value;
      }, 0);

      var avg = sum / data.length;
      return avg;
    };

    var drawDiverters = function(waterRights){
      console.log(waterRights);
    };

    //find the reach code of the flowline that touches the proposed point of diversion
    // var findReachCode = function(){
    //   map.setMapCursor("wait");
    //   // make tolerance envelope
    //   var xmin = (mp.x) - 0.00025;
    //   var ymin = (mp.y) - 0.00025;
    //   var xmax = (mp.x) + 0.00025;
    //   var ymax = (mp.y) + 0.00025;
    //   //update featureServiceUrl
    //   featureServiceUrl = "http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0/query?where=&objectIds=&time=&geometry="+xmin+"%2C+"+ymin+"%2C+"+xmax+"%2C+"+ymax+"&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&resultType=none&distance=5&units=esriSRUnit_Meter&outFields=ReachCode&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pgeojson&token=";
    //   featureServiceRequest(); //find flowline 
    // };
    // request flowline(s) from nds feature service
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
    // find all flowlines matching reach code
    // var findFlowlines = function(){
    //   //change featureServiceUrl to find all flowlines with the first 8 digits of the reach code
    //   featureServiceUrl = "http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0/query?where=Left%28ReachCode%2C+8%29+%3D+%22"+reachCode.slice(0,8).toString()+"%22&objectIds=&time=&geometry=&geometryType=&inSR=&resultType=none&distance=&units=esriSRUnit_Meter&outFields=ReachCode&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pgeojson&token=";
    //   console.log(featureServiceUrl);
    //   featureServiceRequest(); //run request again, this time with updated featureServiceUrl
    // };
    // // draw flowline(s) on map
    var showFlowLines = function(response){
      button1.style.display = "block";
      var flowlineLayer = new GeoJsonLayer({
        data: response
      });
      map.addLayer(flowlineLayer);
      map.setMapCursor("move");
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
            watershedID = response.workspaceID;
            watershed = response.featurecollection[1];
            drawWatershed(); ////////// Draw the returned watershed on the map
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

    // retrieve all water rights holders 
    // var swrcbRequest = function(){
    // 	//send flowline info to server to get swrcb list of diverters
    //   request.open('GET', '/pods', true);
    // 	request.onreadystatechange = function(){
    //     document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
    //     update.style.display = "block"; //show the update container
    //     update.innerHTML = "Retrieving water rights data from State Water Rights Control Board";
    // 		if(request.readyState === 4) { //if response is ready
    // 			document.body.style.cursor = "auto";
    //       update.style.display = "none";
    // 			if(request.status === 200) { //what to do with successful response
    //   				var response = JSON.parse(request.responseText);
    //   				console.log(response);
  		// 		}
  		// 		else {
	   //    			instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
	   //  		} 
		  // 	}
		  // 	else{
		  // 		document.body.style.cursor = "wait";
		  // 	} 
  		// }; 
    //   // send request with flowline and coordinates. server should return list of downstream diverters on that flowline
    //   request.send();
    // };

    ////////* GET THIS PARTY STARTED  *///////
    ready(initialize); //run function
});

var map = null;
var mp;
var featureServiceUrl;
var watershed;
//var reachCode;
var polygon;
var fillSymbol;
var watershedID;
var watershedGraphic;
var watershedLayer;
var instructions = document.getElementById('instructions');
var button1= document.getElementById("button1");
var update = document.getElementById("update");
var button2 = document.getElementById("button2");
var request = new XMLHttpRequest();
var button3 = document.getElementById("button3");