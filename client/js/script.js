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
    "dijit/TooltipDialog",
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
    TooltipDialog,
    SpatialReference,
    Query,
   	dom
) {
  var featureServiceUrl;
  var tracePolyline;
  var dialog;
  var diverterLayer = new GraphicsLayer();
  var selectedLayer = new GraphicsLayer();
  selectedLayer.id = 'selectedLayer';
  function initialize (){
    parser.parse();
  	map = new Map("map", {
        basemap: "topo",
        center: [-119.4179,36.7783],
        zoom: 7,
        smartNavigation: false,
        spatialReference:  4326
    });
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
      sampleDiverters(); //for testing purposes
    });
    // change cursor depending on zoom level
    var mapZoom = map.on("zoom-end", function(){
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
      else{
        mapZoom.remove();
      }
    });

    // var mapClick = map.on("click", function(evt){
    // 	if(map.getZoom() >= 10 && !trace_api.haveTrace()){ //only do if streamer hasn't finished tracing
    // 		showCoordinates(evt); //place marker on map
    //     traceDownstream() //find reachcode of intersecting flowline
    // 	}
    //     else if(trace_api.haveTrace()){
    //       mapClick.remove();
    //     }
    // });

    //when container1 is clicked, compare traceline to ewrims diversion points
    button1.addEventListener("click", function(){
    	this.disabled = "disabled";
      buildFlowGeometry();
      queryDiverters();
    });
    //when button2 is clicked, get diverter info from swrcb
    button2.addEventListener("click", function(){
    	makeTable();
    });
    //when container 3 is clicked, get waterbasin from usgs for each point in selectedLayer
    button3.addEventListener("click", function(){
      this.disabled = "disabled";
      snapToPolyline();
      usgsRequest(0, saveWatershed);
      diverterListener.remove(); // turn off diverterLayer event listeners
      // turn off ability to delete diversions from table
    });

    //add graphic to selectedLayer when diverterLayer graphic is clicked
    diverterLayer.on('mouse-over', function(evt){
      var g = evt.graphic;
      map.infoWindow.setContent(g.getContent());
      map.infoWindow.show(evt.screenPoint,map.getInfoWindowAnchor(evt.screenPoint));
    });
    diverterLayer.on('mouse-out', function(evt){
      map.infoWindow.hide();
    });

    //when graphic is clicked, toggle that graphic's marker symbol color and add to new graphics layer
    var diverterListener = diverterLayer.on('mouse-up', function(evt){
      button2.style.display = "block";
      button3.style.display = "none"; //user must re-build table
      if(evt.graphic._graphicsLayer.id !== selectedLayer.id){ //if graphic is not already in layer
        evt.graphic.setSymbol(new SimpleMarkerSymbol().setSize(10).setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([122, 66, 123,1]))); //change graphic color
        selectedLayer.add(evt.graphic);
        selectedLayer.redraw();
        diverterLayer.redraw();
      }
      else{
        evt.graphic.setSymbol(new SimpleMarkerSymbol().setSize(10).setStyle(SimpleMarkerSymbol.STYLE_CIRCLE).setColor(new Color([255, 0, 0,0.5]))); //change graphic color
        selectedLayer.remove(evt.graphic);
        diverterLayer.redraw();
        selectedLayer.redraw();
      }
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
    map.graphics.add(proposed);
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
      "originPointTextSymbol": trace_api.lastTraceInfo.originStreamName
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

  /////for testing///////////////////////
  var sampleDiverters = function(){
    var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
        SimpleMarkerSymbol.STYLE_CIRCLE).setColor(
        new Color([255,0,0,0.5]));
    var info = new InfoTemplate("Water Right POD", "AppId: ${appId}<br>Stream: ${stream} <br>WR Type: ${wrType}<br>Status: ${wrStatus} <br>divType: ${divType}");
    for(var i = 1; i < 200; i ++){
      var record = ewrims[i];
      var diversion = new Point([record.FIELD19, record.FIELD18]);
      var attr = {
          stream: record.FIELD22,
          face: record.FIELD46,
          site: record.FIELD32,
          rightId: record.FIELD40,
          directDiv: record.FIELD41,
          divToStorage: record.FIELD42,
          divType: record.FIELD47,
          wrType: record.FIELD49,
          wrStatus: record.FIELD50,
          podStatus: record.FIELD45,
          appId: record.FIELD3,
          appPod: record.FIELD5
        };
      var graphic = new Graphic(diversion, sms, attr, info);
      diverterLayer.add(graphic);  
    }
    map.addLayer(diverterLayer);
  };
  /////// end for testing //////////////////////


  var queryDiverters = function(){ // find all water right diversions within flowline extent
    //show only the diverters within the traced streams extent
    var trace = trace_api.allTraceExtents;
    var sms = new SimpleMarkerSymbol().setSize(10).setStyle(
        SimpleMarkerSymbol.STYLE_CIRCLE).setColor(
        new Color([255,0,0,0.5]));
    diverterLayer.id = 'diverterLayer';
    var info = new InfoTemplate("Water Right POD", "Stream: ${stream} <br>WR Type: ${wrType}<br>WR Status: ${wrStatus} <br>divType: ${divType}<br>diversion status: ${podStatus}");
    for(var i = 1; i < ewrims.length; i++){
      var record = ewrims[i];
      var diversion = new Point([record.FIELD19, record.FIELD18]);
      if(trace.contains(diversion)){ //only check distance for points within the extent
        var attr = {
          stream: record.FIELD22,
          face: record.FIELD46,
          site: record.FIELD32,
          rightId: record.FIELD40,
          directDiv: record.FIELD41,
          divToStorage: record.FIELD42,
          divType: record.FIELD47,
          wrType: record.FIELD49,
          wrStatus: record.FIELD50,
          podStatus: record.FIELD45,
          appId: record.FIELD3,
          appPod: record.FIELD5
        };
        var graphic = new Graphic(diversion, sms, attr, info);
        diverterLayer.add(graphic);
      }; 
    };
    map.addLayers([diverterLayer, selectedLayer]);
    button1.style.display = "none";
    instructions.innerHTML = "click on a water right diversion to select it for analysis";
    applyToolTip();
  };
  var buildFlowGeometry = function(){
    var traceGraphics = map._layers.tracePolyLine.graphics;
    var tracePaths = []; //flatten the trace_api paths into one array
    for(var j = 0; j < traceGraphics.length; j++){
      for(var n = 0; n < traceGraphics[j].geometry.paths[0].length; n++){
        tracePaths.push(traceGraphics[j].geometry.paths[0][n]); //push each coordinate pair into the array
      }
    } //build array into a polyline geometry
    tracePolyline = new Polyline(tracePaths);
    tracePolyline.setSpatialReference(new SpatialReference(102100));
    console.log(tracePolyline);
  };
  var applyToolTip = function(){ //make a popup appear upon hover
    dialog = new TooltipDialog({
      id: "tooltipDialog",
      style: "position: absolute; width: 250px; font: normal normal normal 10pt Helvetica;z-index:100"
    });
    dialog.startup();
  };
  var makeTable = function(){
    table.innerHTML = ""; //clear table
    button2.style.display = "none";
    var counter = 0;
    //build table that shows attributes of selectedLayer graphics array
    selectedLayer.graphics.forEach(function(diversion){
      var htmlDiv = makeDiv(diversion.attributes, counter);
      table.insertAdjacentHTML("beforeEnd", htmlDiv);
      counter ++; //increase the counter value so the next div in the table will have different background
    });
    table.style.display = "block";
    instructions.innerHTML = 'delete unwanted diversions from table';
    button3.style.display = 'block';
    allowDeletion();
  };
  var makeDiv = function(attr, counter){
    var background;
    if(counter % 2 === 0){
      background = "lightgrey";
    }
    var htmlDiv = "<div id="+attr.appPod+" class='waterRight' style='background-color:"+background+"'><div><p>"+attr.stream+"</p>\
    <br><span>app: "+attr.appId+"</span><br><span>status: "+attr.wrStatus+"</span><br><span>diversion: "+attr.divType+"</span>\
    <br><span>type: "+attr.wrType+"</span><br>\
    <span>status: "+attr.podStatus+"</span></div><div class='delete'>X</div>";
    return htmlDiv;
  };
  var allowDeletion = function(){
    var deleteDiverters = document.getElementsByClassName("delete");
    for(var i = 0; i < deleteDiverters.length; i ++){
      deleteDiverters[i].addEventListener("click", function(evt){
        console.log('delete graphic from selectedLayer');
        console.log(evt.target.parentNode.id);
        var targetId = evt.target.parentNode.id;
        //find graphic with attr.appPod equal to the parent node id
        var j = 0;
        while (j < selectedLayer.graphics.length){
          if(selectedLayer.graphics[j].attributes.appPod === targetId){
            selectedLayer.remove(selectedLayer.graphics[j]);
            j = selectedLayer.graphics.length + 100; //end loop
          }
          else{
            j ++;
          }
        }
        selectedLayer.redraw(); //redraw the selected layer without the deleted diversion
        makeTable();
      });
    };
  };
  var snapToPolyline = function(){
    //make points in selectedLayer snap to tracePolyline
  };
  // var featureServiceRequest = function(path){
  //   request.open("Get", "http://services.arcgis.com/jDGuO8tYggdCCnUJ/arcgis/rest/services/CAHydrographyFlowlines/FeatureServer/0/query?where=&objectIds=&time=&geometry="+path+"&geometryType=esriGeometryPolyline&inSR=102100&spatialRel=esriSpatialRelTouches&resultType=none&distance=5&units=esriSRUnit_Meter&outFields=&returnGeometry=true&multipatchOption=&maxAllowableOffset=&geometryPrecision=&outSR=4326&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&quantizationParameters=&sqlFormat=none&f=pgeojson&token=");
  //   request.onreadystatechange = featureServiceChange;
  //   request.send();
  // };
  // var featureServiceChange = function(){
  //   document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
  //   update.style.display = "block"; //show the update container
  //   update.innerHTML = "Requesting data from National Hydrography Dataset";
  //   if(request.readyState === 4) { //if response is ready
  //     document.body.style.cursor = "auto";
  //     update.style.display = "none";
  //     if(request.status === 200) { //what to do with successful response
  //         var response = JSON.parse(request.responseText);
  //         console.log(response);
  //         //reachCode = response.features[0].properties.ReachCode;
  //         showFlowLines(response);
  //     }
  //     else {
  //         instructions.innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
  //     } 
  //   }
  // };

  // request waterbasin data from usgs based on coordinates
  function usgsRequest(counter, callback){
    update.style.display = "block"; //show the update container
    update.innerHTML = "Retrieving watershed data from USGS";
    instructions.innerHTML = ""; //clear instructions  
    document.body.style.cursor = "wait"; //make cursor indicate that data is being loaded
    console.log(counter);
    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){
      if(request.status === 200 && request.readyState === 4){
        console.log(request);
        callback(JSON.parse(request.responseText));
        counter ++;
        mySyncFunction(); //call again to perform another request to usgs server
      }
    };

    var mySyncFunction = function(){
      console.log('counter: '+ counter);
      if(counter < selectedLayer.graphics.length){ //only do if there's still another graphic
        var x = selectedLayer.graphics[counter].geometry.x;
        var y = selectedLayer.graphics[counter].geometry.y;
        var usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation='+x+'&ylocation='+y+'&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
        request.open("Get", usgsBasinUrl, true);
        request.send();
      }
      else{
        console.log('end');
        document.body.style.cursor = "auto";
        update.style.display = "none";
        button3.style.display = "none";
      }
    };
    mySyncFunction();
  };

  var saveWatershed = function(response){
    var watershed = response.featurecollection[1];
    var area = response.featurecollection[1].feature.features[0].properties.DRNAREA;
    var watershedID = response.workspaceID; 
    drawWatershed(watershed); //draw watershed
    downstreamRights.push({
      watershed: watershed,
      area: area,
      watershedID: watershedID
    });
    console.log(downstreamRights);
    button4.style.display = "block"; //show button4
    //add area to table
    var areaSpan = "<br><span>area (sq mi): "+area+"</span>";
    return table.children[downstreamRights.length - 1].children[0].insertAdjacentHTML("beforeEnd", areaSpan);
  };
  // draw watershed on map
  var drawWatershed = function(watershed){
    map.removeLayer(diverterLayer);
    map.addLayer(selectedLayer);
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

var downstreamRights = [];
var instructions = document.getElementById('instructions');
var button1= document.getElementById("button1");
var update = document.getElementById("update");
var button2 = document.getElementById("button2");
var button3 = document.getElementById("button3");
var table = document.getElementById("table");
var button4 = document.getElementById("button4");
