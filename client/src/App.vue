<template>
  <div id="app">
    <MapDiv
      @pointFound='pointFound'
      @zoomed='zoomed'
    ></MapDiv>
    <Display :counter='counter' @increaseCounter='increaseCounter'></Display>
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

    zoomed(isTrue){
      if (isTrue) {
        this.increaseCounter();
      }
      else {
        this.decreaseCounter();
      }
    },

    increaseCounter(){
      this.counter ++;
      this.checkCounter();
    },

    decreaseCounter() {
      if (this.counter > 1) {
        this.counter --;
      }
    },

    checkCounter(){
      // counter == 2 get all upstream diverters
      if(this.counter == 3){
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
