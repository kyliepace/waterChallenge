
var makeMap = function(){require([
	"esri/layers/FeatureLayer",
	
	], function(FeatureLayer) {
		
		});
		
		
	  	var featureLayer = new FeatureLayer({
	  		fields:[
	  		{
	  			name: 'city',
	  			alias: 'unique city',
	  			type: 'string'
	  		},
	  		{
	  			name: 'freq',
	  			nullable: true,
	  			alias: 'number of people',
	  			type: 'integer'
	  		}],
	  		objectIdField: 'objectID',
	  		geometryType: 'point',
	  		spatialReference: { wkid: 4326 },
	   		source: cities,  //  an array of graphics with geometry and attributes
	                     // popupTemplate and symbol are not required in each graphic
	                     // since those are handled with the popupTemplate and
	                     // renderer properties of the layer
	   		popupTemplate: pTemplate,
	   		renderer: renderer 
	  	});

	  	var map = new Map({
	  		basemap: "gray-vector", 
	  		layers: [featureLayer]
	  	});
	  
	  	var view = new MapView({
	  		container: "viewDiv",
	  		center: [-97.5, 40],
	  		zoom: 4,
	  		map: map
	  		// extent: { // autocasts as new Extent()
	    //         xmin: -7707811,
	    //         ymin: 3547000,
	    //         xmax: -13376791,
	    //         ymax: 5247784,
	    //         spatialReference: 102100
	    //       }
	  	});
	});
};

document.addEventListener("DOMContentLoaded", function(e){
	makeMap();
});
