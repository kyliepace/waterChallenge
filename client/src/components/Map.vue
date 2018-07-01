<template>
	<div id='map' ref='map' v-on:click='traceStream' ></div>
</template>

<script>

import { loadModules } from 'esri-loader';

export default{
	name: 'MapDiv',
	data(){
		return {
			map: '',
			center: [36.7783, -119.4179],
			zoom: 7,
			loading: false
		}
	},

	mounted(){
		loadModules([
			'esri/map', 
			'esri/geometry/webMercatorUtils'
		])
      .then(([Map, webMercatorUtils]) => {
        // create map with the given options
        this.map = new Map(this.$refs.map, {
          basemap: 'topo',
					center: [-119.4179,36.7783],
					zoom: 7,
					smartNavigation: false,
					spatialReference:  4326
				});
				this.map.on('load', () => {
					this.map.hidePanArrows();
					this.map.showZoomSlider();
					this.map.setMapCursor('move');
				});
				let mapZoom = this.map.on('zoom-end', () => {
					if (!trace_api.haveTrace()) {
						let zoomLevel = this.map.getZoom();
						if (zoomLevel >= 10) {
							this.map.setMapCursor('crosshair');
						}
						else {
							this.map.setMapCursor('move');
						}
					}
					else {
						mapZoom.remove();
					}
				});
				
				this.webMercatorUtils = webMercatorUtils;
    
      })
      .catch(err => {
        // handle any script or module loading errors
        console.error(err);
      });
	},

	methods: {
		traceStream(e) {
			console.log('trace stream');
			let mp = this.webMercatorUtils.webMercatorToGeographic(e.mapPoint);

			if(this.map.getZoom() >= 10 && !trace_api.haveTrace()) {
				trace_api.addTrace({
					"map": this.map,
					"x": mp.x,
					"y": mp.y,
					"traceLineColor": [46, 138, 138, 1],
					"traceLineStyle": "STYLE_SHORTDASHDOT",
					"originPoint": "infoHover",
					"clearOldTraces": true,
					"originPointTextSymbol": trace_api.lastTraceInfo.originStreamName
				});

				trace_api.on('trace-success', () => {
					console.log('trace success');
				});
			}			
		},

		findBasin(point) {
			this.loading = true;

			axios.get(`https://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation=${point.lat}&ylocation=${point.lng}&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true`).then( fc => {
				console.log(fc);
				this.loading = false;
				
			});
		}
	}
}

</script>


<style scoped>
#map{
	width: 100%;
	height: 100%;
	cursor: crosshair;
}
</style>