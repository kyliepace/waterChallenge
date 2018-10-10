<template>
  <div id="app">
    <MapDiv
      :basin='basin'
      :downstreamRights='downstreamRights'
      @traceSuccess='traceSuccess'
      @next='next'
      @rightSelected='rightSelected'
    ></MapDiv>
    <Display
      :counter='counter'
      :loading='loading'
      @increaseCounter='increaseCounter'
      @queryDatabaseByBasin='queryDatabaseByBasin'
      @findBasin='findBasin'
      @exportTable='exportTable'
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
      counter: 0,
      loading: false,
      extent: {},
      point: undefined,
      downstreamRights: [],
      downstreamPoint: {},
      basin: [],
      allRights: []
    }
  },
  methods: {
    traceSuccess(layers){
      this.stream = layers.polyline;
      this.point = layers.origin;
      // reset any existing data
      this.basin = [];
      this.queryDatabaseByStream();
    },

    next(isTrue){
      if (this.counter < 1) {
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

    queryDatabaseByStream() {
      let that = this;
      this.loading = true;
      // find points in RDS that are within the basin
      try {
        axios.post('/find-diverters', {
          geometry: that.stream
        })
        .then(res => {
          if (res.status == 200 && res.data.length > 0 ) {
            console.log('found ' + res.data.length + ' existing rights')
            that.downstreamRights = res.data;
            that.loading = false;
            that.counter = 2;
          }
          else {
            throw new Error('no senior rights found');
          }
        })
        .catch(err => {
          that.loading = false;
          that.counter = 1;
          throw err;
        })
      }
      catch(err) {
        console.log(err);
      }
    },

    rightSelected(point) {
      this.downstreamPoint = point;
      this.increaseCounter();
    },

    findBasin() {
      console.log('find basin for point ', this.downstreamPoint);
      let that = this;
      this.loading = true;
      let point = this.downstreamPoint;

      try {
        axios.post('/find-basin', {
          point
        })
        .then(basin => {
          if (basin.status === 200 && basin.data.length > 0) {
            that.basin = basin.data;
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

    queryDatabaseByBasin() {
      let that = this;
      this.loading = true;
      try {
        axios.post('/sum-face-values', {
          basin: that.basin,
          points: that.downstreamRights
        })
        .then(res => {
          that.loading = false;
          console.log('upstream diverters at each pod on stream', res.body);
          if (res.status === 200){
            that.allRights = res.body;
          }
          // create table with downstreamRights PODs on stream and the upstream demand at each POD
          that.increaseCounter();
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
