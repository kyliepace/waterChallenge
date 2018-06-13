<template>
	<div id='mapid'></div>
</template>

<script>
import L from 'leaflet'
//import '../../node_modules/leaflet/dist/leaflet.css'

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
		this.establishMap();

		// add listener so when point clicked, send point to usgs
		this.map.on('click', e => {
			this.$emit('pointFound', e.latlng);
		});
	},

	methods: {
		establishMap(){
			this.map = L.map('mapid').setView(this.center, this.zoom);
			L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
			}).addTo(this.map);

			this.map.cursor
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
#mapid{
	width: 100%;
	height: 100%;
	cursor: crosshair;
}
.leaflet-map-pane{
	width: 100%;
}
</style>