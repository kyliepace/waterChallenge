<template>
	<div id='map' ref='map' v-on:dblclick='traceStream' ></div>
</template>

<script>
import { loadModules } from 'esri-loader';


export default{
	name: 'MapDiv',
	props: ['basin', 'downstreamRights'],
	data(){
		return {
			map: undefined,
			webMercatorUtis: undefined,
			pod: undefined,
			basinLayer: undefined
		}
	},
	mounted(){
		loadModules([
			'esri/map',
			'esri/geometry/webMercatorUtils',
			'esri/layers/GraphicsLayer',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleLineSymbol',
			'esri/graphic',
			'esri/geometry/Polygon',
			'esri/Color',
		])
      .then(
			([
				Map,
				webMercatorUtils,
				GraphicsLayer,
				SimpleFillSymbol,
				SimpleLineSymbol,
				Graphic,
				Polygon,
				Color
			]) => {
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

				let basinStyle = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
          new SimpleLineSymbol(
						SimpleLineSymbol.STYLE_DASHDOT,
						new Color([66,134,244]),
						2
					),
					new Color([83,127,198,0.8])
				);

				let basinPolygon = new Polygon({
					'rings': this.basin,
					'spatialReference': {'wkid': 4326}
				});
				let graphic = new Graphic(basinPolygon, basinStyle);
				this.basinLayer = new GraphicsLayer().add(graphic);

      })
      .catch(err => {
        console.error(err);
      });
	},

	methods: {
		traceStream(e) {
			this.pod = this.webMercatorUtils.webMercatorToGeographic(e.mapPoint);
			let that = this;

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
					"zoomToTrace": false,
					"basemap": false
				});

				trace_api.on('trace-success', () => {
					trace_api.zoomToLastTraceExtent();
					this.$emit('traceSuccess', {
						polyline: trace_api.map.getLayer("tracePolyLine").graphics.map(graphic => {
							graphic.geometry = that.webMercatorUtils.webMercatorToGeographic(graphic.geometry, true);
							return graphic.geometry.paths[0]
						}),
						origin: trace_api.map.getLayer("traceOriginPoint"),
						stagedTraces: trace_api.map.getLayer("stagedTraces")
					}, this.pod);
					this.map.setMapCursor('move');
				});
			}
		}
	},

	watch: {
		basin() {

			this.map.addLayer(this.basinLayer);
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