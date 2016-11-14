require([
    "dojo/ready",
    "dojo/parser",
    "esri/map",
    "esri/layers/ArcGISTiledMapServiceLayer",
   	"esri/geometry/webMercatorUtils", 
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
    ArcGISTiledMapServiceLayer,
   	webMercatorUtils, 
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
	        smartNavigation: false
	    });
	    console.log('created map');

	    map.on("load", function() {
	    	map.hidePanArrows();
	    	map.showZoomSlider();
	        //after map loads, connect to listen to mouse move & drag events 
	        drawWatershed();           //for testing purposes let's call this here
	    });

	    map.on("click", function(evt){
	    	showCoordinates(evt);
	    });

	    document.getElementById("container1").addEventListener("click", function(){
	    	this.disabled = "disabled";
	   //  	request.open("Get", usgsBasinUrl);
	   //  	request.send();
	   //  	request.onreadystatechange = function(){
	   //  		var update = document.getElementById("container2");
	   //  		if(request.readyState === 4) { //if response is ready
		 	// 		update.style.display = "none";
		 	// 		document.body.style.cursor = "auto";
		  //   			if(request.status === 200) { //what to do with successful response
		  //     				var response = JSON.parse(request.responseText);
		  //     				console.log(response);
		  //     				watershedID = response.workspaceID;
		  //     				watershed = response.featurecollection[1].feature;
		  //     				console.log(watershed);
		  //     				drawWatershed();
	   //  				}
	   //  				else {
			 //      			document.getElementById('info').innerHTML = 'An error occurred during your request: ' +  request.status + ' ' + request.statusText;
			 //    		} 
			 //  	}
			 //  	else{
			 //  		update.style.display = "block";
			 //  		update.innerHTML = "Retrieving watershed data from USGS";
			 //  		document.body.style.cursor = "wait";
			 //  	} 
			 // };  
	    });
    };

    function showCoordinates(evt, map) {
    	//the map is in web mercator but display coordinates in geographic (lat, long)
        var mp = webMercatorUtils.webMercatorToGeographic(evt.mapPoint);
        //display mouse coordinates
        dom.byId("container1").innerHTML = "Calculate basin from "+ mp.x.toFixed(5) + ", " + mp.y.toFixed(5);
        dom.byId("container1").style.display = "block";
        //update url with coordinates
        usgsBasinUrl = 'http://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.json?rcode=CA&xlocation='+mp.x.toFixed(5)+'&ylocation='+mp.y.toFixed(5)+'&crs=3310&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true';
    };

    function drawWatershed(){
    	var rings = waterbasin.featurecollection[1].feature.features[0].geometry.rings[0];
    	console.log(map);
  		/********************************************
        * Create a polygon graphic of the watershed *
        *********************************************/
   		//var polygonJson  = {"rings":rings,"spatialReference":{"wkid":3310 }};
			var polygon = new Polygon();
			polygon.addRing(rings);
			polygon.spatialReference = map.spatialReference;
      	// Create a symbol for rendering the graphic
      	var fillSymbol = new SimpleFillSymbol(
      		SimpleFillSymbol.STYLE_SOLID,
			new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_DASHDOT,
					new Color([255,0,0]), 
					200
			),
			new Color([255,255,0,0.7])
		);
 
        var watershedGraphic = new Graphic(polygon, fillSymbol, {keeper: true}) ;

        var watershedLayer = new GraphicsLayer({id: "basin"});  
        watershedLayer.setScaleRange(0,0); //make sure it's visible at all scales
        watershedLayer.setVisibility(true);
        map.addLayer(watershedLayer);
        map.reorderLayer(watershedLayer, 1);
        console.log('added layer to map');
        watershedLayer.add(watershedGraphic);
        console.log('added graphic to layer');
        console.log(watershedLayer);
        watershedLayer.redraw();
    };

    ready(initialize);
});

var map = null;
var usgsBasinUrl;
var watershed;
var watershedID;
var request = new XMLHttpRequest();
