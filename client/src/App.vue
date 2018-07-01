<template>
  <div id="app">
    <MapDiv @pointFound='pointFound'></MapDiv>
    <!--<Display :counter='counter' @increaseCounter='increaseCounter'></Display> -->
  </div>
</template>

<script>
import MapDiv from './components/Map.vue'
import Display from './components/Display.vue'

export default {
  name: 'app',
  components: {
    MapDiv, Display
  },
  data(){
    return {
      counter: 1
    }
  },
  methods: {
    pointFound(point){
      //TODO: find point closet to the selected point
      /* send point to server*/
      /* create feature collection from sql points*/
      /* use turf.js to find closed feature collection point to the passed point*/
      /* save resulting point as this.startingPoint */
      this.increaseCounter();
    },

    increaseCounter(){
      this.counter ++;
      this.checkCounter();
    },
    checkCounter(){
      // counter == 2 get all upstream diverters
      if(this.counter == 2){
        console.log('get all upstream diverters');

        //TODO: query loopback api to find all pods upstream of this.startingPoint
      }
      

      // counter == 3 build basin at each diversion

      // counter == 4 find all diversions within each basin and sum all diversions
    }
  }
}
</script>

<style>
/* esri styles */
@import url('https://js.arcgis.com/3.23/esri/css/esri.css');

@import url('https://fonts.googleapis.com/css?family=Poppins');

#app {
  font-family: 'Poppins', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  width: 100vw;
  height: 100vh;
  margin: 0px;
  padding: 0px;
  overflow: hidden;
}

html, body, #map {
    height: 100%;
    width: 100%;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>
