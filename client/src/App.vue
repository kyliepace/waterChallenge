<template>
  <div id="app">
    <MapDiv
      :basin='basin'
      :downstreamRights='downstreamRights'
      @traceSuccess='traceSuccess'
      @next='next'
    ></MapDiv>
    <Display
      :counter='counter'
      :loading='loading'
      @increaseCounter='increaseCounter'
      @queryDatabase='queryDatabase'
      @findBasin='findBasin'
    ></Display>
    <Loading :loading='loading' />
  </div>
</template>

<script>
import MapDiv from './components/Map.vue'
import Display from './components/Display.vue'
import Loading from './components/Loading.vue';
import axios from 'axios';

export default {
  name: 'app',
  components: {
    MapDiv, Display, Loading
  },
  data(){
    return {
      counter: 1,
      loading: false,
      extent: {},
      point: undefined,
      downstreamRights: [],
      downstreamPoint: [],
      basin: []
    }
  },
  methods: {
    traceSuccess(layers){
      this.stream = layers.polyline;
      console.log(this.stream)
      this.point = layers.origin;
      let downstreamArray = this.stream[this.stream.length - 1];
      this.downstreamPoint = this.stream[this.stream.length - 1][0];
      this.increaseCounter();
    },

    next(isTrue){
      if (this.counter < 2) {
        if (isTrue) {
          this.increaseCounter();
        }
        else {
          this.decreaseCounter();
        }
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

    findBasin() {
      console.log('find basin for downstream point: ', this.downstreamPoint);
      let that = this;
      this.loading = true;
      let point = this.downstreamPoint;
      try {
        axios.post('/find-basin', {
          point
        })
        .then(fc => {
          if (fc.data.length > 1) {
            that.basin = fc.data[1].feature.features.map(feature => {
              return feature.geometry.coordinates;
            });
            console.log(that.basin);
            that.increaseCounter();
            that.loading = false;
          }
          else {
            throw new Error('no basin found');
          }
        })
        .catch(err => {
          console.log(err)
          that.loading = false;
          throw err;
        })
      }
      catch(err) {
        console.log(err);
      }
    },

    queryDatabase() {
      console.log('query database');
      let that = this;
      this.loading = true;
      // find points in RDS that are within the basin
      try {
        axios.post('/find-diverters', {
          geometry: that.basin
        })
        .then(res => {
          console.log(res);
          if (res.data.length > 0) {
            that.downstreamRights = res.data;
            that.loading = false;
            that.increaseCounter();
          }
          else {
            throw new Error('no senior rights found');
          }
        })
        .catch(err => {
          that.loading = false;
          throw err;
        })
      }
      catch(err) {
        console.log(err);
      }
    },

    queryDatabaseByBasin() {
      let that = this;
      this.loading = true;
      try {
        axios.get('/sum-face-values', {
          basin: that.basin,
          points: that.downstreamRights
        })
        .then(res => {
          that.loading = false;
          console.log('upstream diverters at each pod on stream', res);
          // create table with downstreamRights PODs on stream and the upstream demand at each POD
        })
        .catch(err => {
          that.loading = false;
          throw err;
        })
      }
      catch(err){
        console.log(err);
      }
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
