<template>
	<div id='map' ref='map' v-on:dblclick='traceStream'></div>
</template>

<script>
import { loadModules } from 'esri-loader';
import createBasinLayer from '../functions/create-basin-layer';
import createDownstreamLayer from '../functions/create-downstream-layer.js';

export default{
	name: 'MapDiv',
	props: ['basin', 'downstreamRights'],
	data(){
		return {
			map: undefined,
			webMercatorUtis: undefined,
			pod: undefined,
			basinLayer: undefined,
			esri: {
				Point: undefined,
				SimpleMarkerSymbol: undefined,
				Color: undefined,
				InfoTemplate: undefined,
				Graphic: undefined
			}
		}
	},
	mounted(){
		loadModules([
			'esri/map',
			'esri/geometry/webMercatorUtils',
			'esri/layers/GraphicsLayer',
			'esri/symbols/SimpleFillSymbol',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/graphic',
			'esri/geometry/Polygon',
			'esri/geometry/Point',
			'esri/Color',
			'esri/InfoTemplate'
		], {
			url: "https://js.arcgis.com/3.14/"
		})
      .then(
			([
				Map,
				webMercatorUtils,
				GraphicsLayer,
				SimpleFillSymbol,
				SimpleLineSymbol,
				SimpleMarkerSymbol,
				Graphic,
				Polygon,
				Point,
				Color,
				InfoTemplate
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

				this.esri = {
					GraphicsLayer,
					Point,
					Polygon,
					SimpleMarkerSymbol,
				SimpleFillSymbol,
					SimpleLineSymbol,
					Color,
					InfoTemplate,
					Graphic
				};
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
					"zoomToTrace": false
				});

				trace_api.on('trace-success', () => {
					// trace_api.zoomToLastTraceExtent();
					this.$emit('traceSuccess', {
						polyline: trace_api.map.getLayer("tracePolyLine").graphics.map(graphic => {
							graphic.geometry = that.webMercatorUtils.webMercatorToGeographic(graphic.geometry, true);
							return graphic.geometry.paths[0]
						}),
						origin: trace_api.map.getLayer("traceOriginPoint"),
						selectedPod: that.pod
					});
					this.map.setMapCursor('move');
				});
			}
		}
	},

	watch: {
		basin() {
			if (this.basin.length > 0) {
				let that = this;
				let layer = createBasinLayer(that.basin, that.esri);
				this.map.addLayer(layer);
				trace_api.map.addLayer(that.basinLayer);
			}
		},

		downstreamRights() {
			if (this.downstreamRights.length > 0) {
				let that = this;
				let layer = createDownstreamLayer(that.downstreamRights,
					that.esri,
					selectedPoint => {
						that.$emit('rightSelected', {
							x: selectedPoint.x,
							y: selectedPoint.y
						})
					}
				);
				this.map.addLayer(layer.downstreamLayer);
				this.map.addLayer(layer.selectedPointLayer);
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