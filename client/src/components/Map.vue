<template>
	<div id='map' ref='map' v-on:dblclick='traceStream' ></div>
</template>

<script>
import { loadModules } from 'esri-loader';

export default{
	name: 'MapDiv',
	data(){
		return {
			map: undefined,
			webMercatorUtis: undefined,
			pod: undefined
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
					this.map.disableDoubleClickZoom();
				});
				let mapZoom = this.map.on('zoom-end', (e) => {
					let zoomLevel = e.level >= 10;
					this.$emit('next', zoomLevel);
					let cursorType = zoomLevel ? 'crosshair' : 'move';
					this.map.setMapCursor(cursorType);
				});
				this.webMercatorUtils = webMercatorUtils;
      })
      .catch(err => {
        console.error(err);
      });
	},

	methods: {
		traceStream(e) {
			this.pod = this.webMercatorUtils.webMercatorToGeographic(e.mapPoint);

			if(this.map.getZoom() >= 10) {
				trace_api.addTrace({
					"map": this.map,
					"x": this.pod.x,
					"y": this.pod.y,
					"traceLineColor": [46, 138, 138, 1],
					"traceLineStyle": "STYLE_SHORTDASHDOT",
					"originPoint": "infoHover",
					"clearOldTraces": true,
					"originPointTextSymbol": trace_api.lastTraceInfo.originStreamName,
					"zoomToTrace": false
				});

				trace_api.on('trace-success', () => {
					this.$emit('next', true);
					this.$emit('traceSuccess', trace_api.allTraceExtents, this.pod);
					this.map.setMapCursor('move');
				});
			}
		}
	}
}

</script>


<style scoped>
@import url('https://js.arcgis.com/3.14/esri/css/esri.css');
#map{
	width: 80vw;
}
</style>