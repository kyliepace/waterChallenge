<template>
  <div id="app">
    <MapDiv
      @traceSuccess='traceSuccess'
      @next='next'
    ></MapDiv>
    <Display
      :counter='counter'
      @increaseCounter='increaseCounter'
      @queryDatabase='queryDatabase'
    ></Display>
  </div>
</template>

<script>
import MapDiv from './components/Map.vue'
import Display from './components/Display.vue'
import axios from 'axios';

export default {
  name: 'app',
  components: {
    MapDiv, Display
  },
  data(){
    return {
      counter: 1,
      loading: false,
      extent: {},
      point: undefined
    }
  },
  methods: {
    traceSuccess(extent, point){
      this.extent = extent;
      this.point = point;
    },

    next(isTrue){
      if (isTrue) {
        this.increaseCounter();
      }
      else {
        this.decreaseCounter();
      }
    },

    increaseCounter(){
      this.counter ++;
    },

    decreaseCounter() {
      if (this.counter > 1) {
        this.counter --;
      }
    },

    queryDatabase() {
      this.loading = true;
      // send point to server, find points in RDS that are on the stream
      console.log('query database')

      // on success, add results to map and increase counter
    },

    findBasin(pnt) {
      this.loading = true;
      console.log('find basin for point: ', pnt);

			axios.get(`https://streamstatsags.cr.usgs.gov/streamstatsservices/watershed.geojson?rcode=CA&xlocation=${point.lat}&ylocation=${point.lng}&crs=4326&includeparameters=false&includeflowtypes=false&includefeatures=true&simplify=true`).then( fc => {
				console.log(fc);
        this.loading = false;
        // create basin from the selected point of diversion
        // find points in RDS that are within that basin

			});
    },
  }
}
</script>

<style>
/* esri styles */

@import url('https://fonts.googleapis.com/css?family=Poppins');

#app {
  font-family: 'Poppins', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
}

html, body, #map, #info{
    height: 100vh;
    width: 100%;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>
