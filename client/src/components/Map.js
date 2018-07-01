// import 'https://js.arcgis.com/3.14/';
// import trace_api from 'https://txpub.usgs.gov/DSS/Streamer/api/3.14/js/trace_api.min.js';
// load esri styles for version 4.7 using loadCss
import { loadModules, loadCss } from 'esri-loader';
import Vue from 'vue';
loadCss('https://js.arcgis.com/3.14/esri/css/main.css');

const options = {
  url: 'https://js.arcgis.com/3.14/'
};

loadModules(['esri/map'], options)
.then(([Map]) => {
  var map = new Map("map", {
    basemap: "topo",
    center: [-119.4179,36.7783],
    zoom: 7,
    smartNavigation: false,
    spatialReference:  4326
  });

  let EsriMap = Vue.component("esri-map", {
    props: ["map"],
    template: [
      "<div>",
      "<h2>Map</h2>",
      "<button v-on:click='trace'>Trace</button>",
      "</div>"
    ].join(""),
    methods: {
      trace: function() {
        buildFlowGeometry();
      }
    }
  });

  module.exports = EsriMap;

})
.catch(err => {
  console.log(err);
});

//module.exports = { EsriMap };


// require([
//   "dojo/ready",
//   "dojo/parser",
//   "esri/map",
//   "esri/layers/ArcGISTiledMapServiceLayer",
//    "esri/geometry/webMercatorUtils", 
//    "esri/geometry/Point",
//   "esri/geometry/Polyline",
//   "esri/geometry/Multipoint",
//    "esri/symbols/SimpleMarkerSymbol",
//    "esri/geometry/Polygon",
//    "esri/symbols/SimpleFillSymbol",
//    "esri/symbols/SimpleLineSymbol", "esri/Color",
//    "esri/graphic",
//    "esri/layers/FeatureLayer",
//    "esri/layers/GraphicsLayer",
//   "esri/InfoTemplate",
//   "dijit/TooltipDialog",
//   "esri/SpatialReference",
//   "esri/tasks/query",
//    "dojo/dom",
//    "vue"
// ], function (
//   ready,
//   parser,
//   Map,
//   GeoJsonLayer,
//   ArcGISTiledMapServiceLayer,
//    webMercatorUtils, 
//    Point,
//   Polyline,
//   Multipoint,
//    SimpleMarkerSymbol,
//    Polygon,
//    SimpleFillSymbol,
//    SimpleLineSymbol, Color,
//    Graphic,
//   FeatureLayer,
//   GraphicsLayer,
//   InfoTemplate,
//   TooltipDialog,
//   SpatialReference,
//   Query,
//   dom,
//   Vue
// ) {
//   var featureServiceUrl;
//   var tracePolyline;
//   var dialog;
//   var diverterLayer = new GraphicsLayer();
//   var selectedLayer = new GraphicsLayer();
//   selectedLayer.id = 'selectedLayer';
//   var EsriMap;

//   var map = new Map("map", {
//     basemap: "topo",
//     center: [-119.4179,36.7783],
//     zoom: 7,
//     smartNavigation: false,
//     spatialReference:  4326
//   });

//   var mp;
//   var downstreamRights = [];
//   var instructions = document.getElementById('instructions');

//   parser.parse();

//   var fillSymbol = new SimpleFillSymbol(
//     SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(
//         SimpleLineSymbol.STYLE_SOLID,
//         new Color([255,0,0,1]), 
//         200
//       ),
//       new Color([255,255,0,1]) 
//   );

//   //when map has loaded, remove the pan arrows and zoom slider
//   map.on("load", function() {
//     map.hidePanArrows();
//     map.showZoomSlider();
//     map.setMapCursor("move");
//   });

//   // change cursor depending on zoom level
//   var mapZoom = map.on("zoom-end", function(){
//     if(!trace_api.haveTrace()){ //only do this if streamer hasn't finished tracing
//       if(map.getZoom() >= 10){
//         map.setMapCursor("crosshair"); //make cursor = crosshair
//         instructions.innerHTML = "click within a stream to select the proposed point of diversion";
//       }
//       else if(map.getZoom() < 10) {
//         map.setMapCursor("move");
//         instructions.innerHTML = "Zoom in to select the proposed point of diversion";
//       }
//     }
//     else{
//       mapZoom.remove();
//     }
//   });

//   var mapClick = map.on("click", function(evt){
//     if(map.getZoom() >= 10 && !trace_api.haveTrace()){ //only do if streamer hasn't finished tracing
//       showCoordinates(evt); //place marker on map
//       traceDownstream() //find reachcode of intersecting flowline
//     }
//       else if(trace_api.haveTrace()){
//         mapClick.remove();
//       }
//   });


//   ////**** FUNCTION LIBRARY *****//////////////
//   function showCoordinates(evt) {
//     //the map is in web mercator but display coordinates in geographic (lat, long)
//     mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
//     //display coordinates within a new button and also on the map
//     var sms = new SimpleMarkerSymbol();
//     sms.setSize(10);
//     sms.setStyle("STYLE_X");
//     var proposed = new Graphic (new Point(evt.mapPoint), sms);
//     map.graphics.add(proposed);
//   };

//   var traceDownstream = function(){ //use USGS Streamer tool to trace flowline downstream from proposed POD
//     trace_api.addTrace({
//       "map": map,
//       "x": mp.x,
//       "y": mp.y,
//       "traceLineColor" : [46, 138, 138, 1],
//       "traceLineStyle" : "STYLE_SHORTDASHDOT",
//       "originPointColor" : [46, 138, 138, 1],
//       "originPoint": "infoHover",
//       "clearOldTraces": true,
//       "originPointTextSymbol": trace_api.lastTraceInfo.originStreamName
//     });
//     if(trace_api.isTracing){
//       update.style.display = "block"; //show the update container
//       update.innerHTML = "Tracing flowline with USGS Streamer";
//     }
//     trace_api.on("trace-success", function(){
//       instructions.innerHTML = "";
//       button1.style.display = "block"; //show next button upon completion of trace
//       map.setMapCursor("auto");
//     });
//   };


//   var buildFlowGeometry = function(){
//     var traceGraphics = map._layers.tracePolyLine.graphics;
//     var tracePaths = []; //flatten the trace_api paths into one array
//     for(var j = 0; j < traceGraphics.length; j++){
//       for(var n = 0; n < traceGraphics[j].geometry.paths[0].length; n++){
//         tracePaths.push(traceGraphics[j].geometry.paths[0][n]); //push each coordinate pair into the array
//       }
//     } //build array into a polyline geometry
//     tracePolyline = new Polyline(tracePaths);
//     tracePolyline.setSpatialReference(new SpatialReference(102100));
//     console.log(tracePolyline);
//   };


//   // Create a Vue component
//   EsriMap = Vue.component("esri-map", {
//     props: ["map"],
//     template: [
//       "<div>",
//       "<h2>Map</h2>",
//       "<button v-on:click='trace'>Trace</button>",
//       "</div>"
//     ].join(""),
//     methods: {
//       trace: function() {
//         buildFlowGeometry();
//       }
//     }
//   });
//   module.exports = EsriMap;

// });

// //module.exports = EsriMap;